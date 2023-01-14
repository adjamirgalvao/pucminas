const ItemCompraService = require("../services/ItemCompraService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const compra = await ItemCompraService.getComprabyId(id);
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const compras = await ItemCompraService.getAllCompras();

    if (!compras) {
      return res.status(404).json("Não existem compras cadastradas!");
    }

    res.json(compras);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const createdCompra = await ItemCompraService.addCompra(req.body);
    res.status(201).json(createdCompra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const deleteResponse = await ItemCompraService.deleteCompra(id);
    res.json(deleteResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
