const CompraService = require("../services/CompraService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const compra = await CompraService.getComprabyId(id);
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const compras = await CompraService.getAllCompras();

    if (!compras) {
      return res.status(404).json("There are no compras published yet!");
    }

    res.json(compras);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    console.log('adicionar compra ', req.body);
    const createdCompra = await CompraService.addCompra(req.body);
    res.status(201).json(createdCompra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const deleteResponse = await CompraService.deleteCompra(id);
    res.json(deleteResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
