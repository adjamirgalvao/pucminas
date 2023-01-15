const ItemCompraService = require("../services/ItemCompraService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const item = await ItemCompraService.getItemComprabyId(id);
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const itens = await ItemCompraService.getAllItensCompras();

    if (!itens) {
      return res.status(404).json("Não existem itens de compras cadastradas!");
    }

    res.json(itens);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const item = await ItemCompraService.addItemCompra(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const deleteResponse = await ItemCompraService.deleteItemCompra(id);
    res.json(deleteResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
