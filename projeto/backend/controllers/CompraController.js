const CompraService = require("../services/CompraService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFKitService");
const RelatorioUtilService = require("../services/RelatorioUtilService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.GESTOR, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await CompraService.getComprabyId(id);
        if (registro) {
          res.json(registro);
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.GESTOR, ROLES.ADMIN])) {
    try {
      const registros = await CompraService.getAllCompras();

      if (!registros) {
        return res.status(404).json("Não existem compras cadastradas!");
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
      const registro = await CompraService.addCompra(req.body);
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
        const compra = {
          data: req.body.data,
          numero: req.body.numero,
          id_fornecedor: req.body.id_fornecedor,
          itensCompra : req.body.itensCompra
        };
        const registro = await CompraService.updateCompra(id, compra);
        if (registro) {
          res.json(registro);
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({});
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
        const registro = await CompraService.deleteCompra(id);
        if (registro) {
          res.json(registro);
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAllCompras = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registros = await CompraService.getAllCompras(id);

        if (!registros) {
          return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
        }

        res.json(registros);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getRelatorioListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.GESTOR, ROLES.ADMIN])) {
    try {
      let dados = await CompraService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFService.gerarPDF(res, 'Compras', [
        { label: 'Data da Compra', property: 'data', width: 70, renderer: null },
        { label: 'Nota Fiscal', property: 'notaFiscal', width: 90, renderer: null },
        { label: 'Fornecedor', property: 'fornecedor', width: 280, renderer: null },
        { label: 'Preço', property: 'preco', width: 70, renderer: (value) => { return RelatorioUtilService.getDinheiro(value) } },], dados);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getExcelListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.GESTOR, ROLES.ADMIN])) {
    try {
      let registros = await CompraService.getExcelListagem();

      res.set({
        'Content-Disposition': 'attachment; filename=Compras.xlsx',
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      res.xls('Compras.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};
