const ItemCompraService = require("../services/ItemCompraService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const item = await ItemCompraService.getItemComprabyId(id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await ItemCompraService.getAllItensCompras();

    if (!registros) {
      return res.status(404).json("Não existem itens de compras cadastradas!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await ItemCompraService.addItemCompra(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await ItemCompraService.deleteItemCompra(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
