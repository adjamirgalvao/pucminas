const ProdutoService = require("../services/ProdutoService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await ProdutoService.getProdutobyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await ProdutoService.getAllProdutos();

    if (!registros) {
      return res.status(404).json("Não existem produtos cadastrados!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await ProdutoService.addProduto(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const produto = {};
    produto.nome = req.body.nome;
    produto.quantidade = req.body.quantidade;
    produto.preco = req.body.preco;
    produto.precoCusto = req.body.precoCusto;

    console.log(produto, id);
    const registro = await ProdutoService.updateProduto(id, produto);

    if (registro.nModified === 0) {
      return res.status(404).json({});
    }

    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await ProdutoService.deleteProduto(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCompras = async (req, res) => {
    let id = req.params.id;

    try {
      const todos = await ProdutoService.getAllCompras(id);
  
      if (!todos) {
        return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
      }
  
      res.json(todos);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
};
