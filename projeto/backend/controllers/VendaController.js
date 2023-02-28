const VendaService = require("../services/VendaService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const ClienteService = require("../services/ClienteService");
const VendedorService = require("../services/VendedorService");
const PDFService = require("../services/PDFKitService");
const RelatorioUtilService = require("../services/RelatorioUtilService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.CLIENTE, ROLES.ADMIN, ROLES.GESTOR])) {
    let id = req.params.id;
    let erro = true;
    if (id.length == 24) {
      try {
        let registro = await VendaService.getVendabyId(id);
        // Se for apenas cliente só pode recuperar a própria compra
        if ((registro) && (!AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.GESTOR, ROLES.ADMIN]))) {
          let email = AutorizacaoService.getEmail(req);
          let cliente = await ClienteService.findOne({ email: email });
          if (cliente) {
            //https://stackoverflow.com/questions/11637353/comparing-mongoose-id-and-strings
            erro = !cliente._id.equals(registro.id_cliente);
          }
        } else {
          erro = false;
        }
        if (erro) {
          res.status(403).json({ error: 'Acesso negado' });
        } else {
          if (registro) {
            res.json(registro);
          } else {
            res.status(404).json({});
          }
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(400).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  let filtroCliente = req.query.filtroCliente;
  let id_cliente = null;
  let erro = false;

  if ((AutorizacaoService.validarRoles(req, [ROLES.CLIENTE]) && filtroCliente) || (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GESTOR]))) {
    try {
      //Se está fazendo filtro por cliente só pode recuperar os registros do cliente que é o usuário logado
      if (filtroCliente) {
        let email = AutorizacaoService.getEmail(req);
        let cliente = await ClienteService.findOne({ email: email });
        if (cliente) {
          id_cliente = cliente._id;
        } else {
          erro = true;
        }
      }
      let registros = [];
      if (!erro) {
        //https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
        registros = await VendaService.getAllVendas(id_cliente, null, null, null);
      }

      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getIndicadoresVendas = async (req, res) => {
  let erro = false;
  if (req.query.id_vendedor && req.query.id_vendedor.length != 24) {
    res.status(400).json({});
  } else {
    if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.GESTOR])) {
      let isApenasVendedor = AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR]) && !AutorizacaoService.validarRoles(req, [ROLES.GESTOR]);
      //Se for apenas vendedor só pode recuperar os registros do vendedor que é o usuário logado
      if (isApenasVendedor) {
        let email = AutorizacaoService.getEmail(req);

        let vendedor = await VendedorService.findOne({ email: email });
        if (vendedor) {
          console.log(req.query.id_vendedor, vendedor._id);
          erro  = (req.query.id_vendedor != vendedor._id);
        } else {
          erro = true;
        }
      }
      if (!erro) {
        try {
          //https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
          registros = await VendaService.getAllVendas(null, req.query.ano, req.query.id_vendedor, true);

          //Se for apenas vendedor remover a coluna de lucro
          if (registros && isApenasVendedor) {
            registros = registros.map(item => {
              const { lucroTotal, ...dados } = item;
                return { ...dados, };
            });
          }
          res.json(registros);
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
      } else {
        res.status(403).json({ error: 'Acesso negado' });
      }
    } else {
      res.status(403).json({ error: 'Acesso negado' });
    }
  }
};


exports.add = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    try {
      const registro = await VendaService.addVenda(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await VendaService.deleteVenda(id);
        if (registro) {
          res.json(registro);
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(400).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getRelatorioListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GESTOR])) {
    try {
      let isGestor = AutorizacaoService.isGestor(req);
      let dados = await VendaService.getExcelListagem(isGestor);

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      let colunas = [
        { label: 'Data', property: 'data', width: 50, renderer: null },
        { label: 'Vendedor', property: 'vendedor', width: 180, renderer: null },
        { label: 'Cliente', property: 'cliente', width: 180, renderer: null },
        { label: 'Valor', property: 'valor', width: 60, renderer: (value) => { return RelatorioUtilService.getDinheiro(value) } },];

      if (isGestor) {
        colunas.push({ label: 'Lucro', property: 'lucro', width: 60, renderer: (value) => { return RelatorioUtilService.getDinheiro(value, true) } },);
      }

      await PDFService.gerarPDF(res, 'Vendas', colunas, dados);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getExcelListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GESTOR])) {
    try {
      let registros = await VendaService.getExcelListagem(AutorizacaoService.isGestor(req));

      res.set({
        'Content-Disposition': 'attachment; filename=Vendas.xlsx',
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      res.xls('Vendas.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};