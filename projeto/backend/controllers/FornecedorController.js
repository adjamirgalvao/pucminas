const FornecedorService = require("../services/FornecedorService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFKitService = require("../services/PDFKitService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      let dados = await FornecedorService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFKitService.gerarPDF(res, 'Fornecedores', [
        { label: 'Nome', property: 'nome', width: 300, renderer: null },
        { label: 'Tipo', property: 'tipo', width: 70, renderer: null },
        { label: 'CPF/CNPJ', property: 'cpf_cnpj', width: 120, renderer: null }], dados);

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getExcelListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      let registros = await FornecedorService.getExcelListagem();

      res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.xls('Fornecedores.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};
