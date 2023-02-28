const ClienteService = require("../services/ClienteService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFKitService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.GESTAO, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await ClienteService.getClientebyId(id);
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


exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.GESTOR, ROLES.CLIENTE, ROLES.ADMIN])) {
    try {
      const registros = await ClienteService.getAllClientes();

      if (!registros) {
        return res.status(404).json("Não existem clientes cadastrados!");
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
      const registro = await ClienteService.addCliente(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};


exports.update = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const cliente = {
          nome: req.body.nome,
          dataNascimento: req.body.dataNascimento,
          email: req.body.email,
          cpf: req.body.cpf,
          endereco: req.body.endereco
        };

        console.log(cliente, id);
        const registro = await ClienteService.updateCliente(id, cliente);

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
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await ClienteService.deleteCliente(id);
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
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    try {
      let dados = await ClienteService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFService.gerarPDF(res, 'Clientes', [
        { label: 'Nome', property: 'nome', width: 300, renderer: null },
        { label: 'CPF', property: 'cpf', width: 70, renderer: null },
        { label: 'Data de Nascimento', property: 'dataNascimento', width: 80, renderer: null }], dados);
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
      let registros = await ClienteService.getExcelListagem();

      res.set({
        'Content-Disposition': 'attachment; filename=Clientes.xlsx',
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      res.xls('Clientes.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};