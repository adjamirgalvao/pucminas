const FornecedorService = require("../services/FornecedorService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await FornecedorService.getFornecedorbyId(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.MASTER])) {
    try {
      const registros = await FornecedorService.getAllFornecedores();

      if (!registros) {
        return res.status(404).json("Não existem fornecedores cadastrados!");
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.MASTER])) {
    try {
      const registro = await FornecedorService.addFornecedor(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.update = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const fornecedor = {
        nome: req.body.nome,
        tipo: req.body.tipo,
        identificacao: req.body.identificacao,
        endereco: req.body.endereco
      };

      console.log(fornecedor, id);
      const registro = await FornecedorService.updateFornecedor(id, fornecedor);

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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await FornecedorService.deleteFornecedor(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};


exports.getRelatorioListagem = async (req, res) => {
  if (true/*AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.MASTER])*/) {
    try {
      let html = await FornecedorService.getRelatorioListagem();

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