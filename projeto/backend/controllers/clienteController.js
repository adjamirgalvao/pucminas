const ClienteService = require("../services/ClienteService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await ClienteService.getClientebyId(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};


exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    let id = req.params.id;

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

      if (registro.nModified === 0) {
        return res.status(404).json({});
      }

      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await ClienteService.deleteCliente(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getRelatorioListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    try {
      let html = await ClienteService.getRelatorioListagem();

      const pdf = await PDFService.gerarPDF(html);

      res.contentType("application/pdf");
      res.send(pdf);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};