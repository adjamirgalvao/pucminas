const VendaService = require("../services/VendaService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const ClienteService = require("../services/ClienteService");
const PDFService = require("../services/PDFKitService");
const RelatorioUtilService = require("../services/RelatorioUtilService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.CLIENTE, ROLES.ADMIN])) {
    let id = req.params.id;
    let erro = true;
    try {
      let registro = await VendaService.getVendabyId(id);
      // Se for apenas cliente só pode recuperar a própria compra
      if ((registro) && (!AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN]))){
        let email = AutorizacaoService.getEmail(req);
        let cliente = await ClienteService.findOne({email: email});
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
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  let filtroCliente = req.query.filtroCliente;
  let id_cliente = null;
  let erro = false;

  if ((AutorizacaoService.validarRoles(req, [ROLES.CLIENTE]) && filtroCliente) || (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN]))) {
    try {
      //Se está fazendo filtro por cliente só pode recuperar os registros do cliente que é o usuário logado
      if (filtroCliente) {
         let email = AutorizacaoService.getEmail(req);
         let cliente = await ClienteService.findOne({email: email});
         if (cliente) {
           id_cliente = cliente._id;
         } else {
           erro = true;
         }
      }
      let registros = [];
      if (!erro){
         //https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
         registros = await VendaService.getAllVendas(id_cliente, req.query.ano, req.query.agrupar);
      }  

      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
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

    try {
      const registro = await VendaService.deleteVenda(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getRelatorioListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    try {
      let dados = await VendaService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFService.gerarPDF(res, 'Vendas', [
        { label: 'Data', property: 'data', width: 70, renderer: null },
        { label: 'Vendedor', property: 'vendedor', width: 200, renderer: null },
        { label: 'Valor', property: 'valor', width: 70, renderer: (value) => {return RelatorioUtilService.getDinheiro(value)} },
        { label: 'Lucro', property: 'lucro', width: 70, renderer: (value) => {return RelatorioUtilService.getDinheiro(value, true)} },], dados);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getExcelListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    try {
      let registros = await VendaService.getExcelListagem();

      res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.xls('Vendedores.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};