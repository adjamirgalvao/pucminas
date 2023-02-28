const VendedorService = require("../services/VendedorService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFKitService");
const RelatorioUtilService = require("../services/RelatorioUtilService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await VendedorService.getVendedorbyId(id);
        if (registro) {
          res.json(registro);
        } else {
          return res.status(404).json({});
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

exports.getByEmail = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    let email = req.params.email;

    try {
      const registro = await VendedorService.getVendedorbyEmail(email);
      if (registro) {
        res.json(registro);
      } else {
        res.status(404).json({ error: 'Vendedor não encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN, ROLES.GESTOR, ROLES.VENDEDOR, ROLES.CLIENTE])) {
    try {
      const registros = await VendedorService.getAllVendedores();

      if (!registros) {
        return res.status(404).json("Não existem vendedores cadastrados!");
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      const registro = await VendedorService.addVendedor(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.update = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const vendedor = {
          nome: req.body.nome,
          cpf: req.body.cpf,
          email: req.body.email,
          salario: req.body.salario,
          endereco: req.body.endereco
        };

        console.log(vendedor, id);
        const registro = await VendedorService.updateVendedor(id, vendedor);

        if (registro.modifiedCount === 0) {
          return res.status(404).json({});
        }

        res.json(registro);
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

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await VendedorService.deleteVendedor(id);
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      let dados = await VendedorService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFService.gerarPDF(res, 'Vendedores', [
        { label: 'Nome', property: 'nome', width: 300, renderer: null },
        { label: 'CPF', property: 'cpf', width: 70, renderer: null },
        { label: 'Salário', property: 'salario', width: 120, renderer: (value) => { return RelatorioUtilService.getDinheiro(value) } }], dados);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getExcelListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      let registros = await VendedorService.getExcelListagem();

      res.set({
        'Content-Disposition': 'attachment; filename=Vendedores.xlsx',
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      res.xls('Vendedores.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};