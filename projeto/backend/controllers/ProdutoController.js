const ProdutoService = require("../services/ProdutoService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");
const PDFService = require("../services/PDFKitService");
const RelatorioUtilService = require("../services/RelatorioUtilService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await ProdutoService.getProdutobyId(id);
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.VENDEDOR, ROLES.GESTOR, ROLES.CLIENTE, ROLES.ADMIN])) {
    try {
      let registros;

      //Fazendo a consulta para ver se quer com saldo ou sem
      if (!req.query.saldo) {
        registros = await ProdutoService.getAllProdutos();
      } else {
        registros = await ProdutoService.getAllProdutosComSaldo();
      }

      if (!registros) {
        return res.status(404).json("Não existem produtos cadastrados!");
      }

      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAllComSaldo = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      const registros = await ProdutoService.getAllProdutosComSaldo();

      if (!registros) {
        return res.status(404).json("Não existem produtos cadastrados com saldo!");
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
      const registro = await ProdutoService.addProduto(req.body);
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
        const produto = {};
        produto.nome = req.body.nome;
        produto.quantidade = req.body.quantidade;
        produto.preco = req.body.preco;
        produto.precoCusto = req.body.precoCusto;

        console.log(produto, id);
        const registro = await ProdutoService.updateProduto(id, produto);

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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await ProdutoService.deleteProduto(id);
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

exports.getAllItensCompras = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const todos = await ProdutoService.getAllItensCompras(id);

        if (!todos) {
          return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
        }

        res.json(todos);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      res.status(400).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getIndicadoresCompras = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.GESTOR])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        let todosDados = await ProdutoService.getIndicadoresCompras(id, req.query.ano);
        
        if (!todosDados) {
          return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
        }

        res.json(todosDados);
      } catch (err) {
        return res.status(500).json({ error: err.message });
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
      let dados = await ProdutoService.getExcelListagem();

      //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
      await PDFService.gerarPDF(res, 'Produtos', [
        { label: 'Nome', property: 'nome', width: 200, renderer: null },
        { label: 'Estoque', property: 'estoque', width: 70, renderer: null },
        { label: 'Preço Unitário', property: 'preco', width: 70, renderer: (value) => { return RelatorioUtilService.getDinheiro(value) } },
        { label: 'Preço de Custo', property: 'precoCusto', width: 70, renderer: (value) => { return RelatorioUtilService.getDinheiro(value) } },], dados);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getExcelListagem = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      let registros = await ProdutoService.getExcelListagem();

      res.set({
        'Content-Disposition': 'attachment; filename=Produtos.xlsx',
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      res.xls('Produtos.xlsx', registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};