const FornecedorService = require("../services/FornecedorService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFKitService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await FornecedorService.getFornecedorbyId(id);
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

    if (id.length == 24) {
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
      res.status(400).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await FornecedorService.deleteFornecedor(id);
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      let dados = await FornecedorService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFService.gerarPDF(res, 'Fornecedores', [
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

      res.set({
        'Content-Disposition': 'attachment; filename=Fornecedores.xlsx',
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      res.xls('Fornecedores.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};
