const ProdutoService = require("../services/ProdutoService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const produto = await ProdutoService.getProdutobyId(id);
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const produtos = await ProdutoService.getAllProdutos();

    if (!produtos) {
      return res.status(404).json("Não existem produtos cadastrados!");
    }

    res.json(produtos);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const createdProduto = await ProdutoService.addProduto(req.body);
    res.status(201).json(createdProduto);
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
    const updatedProduto = await ProdutoService.updateProduto(id, produto);

    if (updatedProduto.nModified === 0) {
      return res.status(404).json({});
    }

    res.json(updatedProduto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const deleteResponse = await ProdutoService.deleteProduto(id);
    res.json(deleteResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
