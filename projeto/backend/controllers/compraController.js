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
      return res.status(404).json("Não existem compras cadastradas!");
    }

    res.json(compras);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const compra = await CompraService.addCompra(req.body);
    res.status(201).json(compra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const compra = {};
    compra.data = req.body.data;
    compra.numero = req.body.numero;

    console.log(compra, id);
    const updatedCompra = await CompraService.updateCompra(id, compra);

    if (updatedCompra.nModified === 0) {
      return res.status(404).json({});
    }

    res.json(updatedCompra);
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

exports.getAllCompras = async (req, res) => {
    let id = req.params.id;

    try {
      const compras = await CompraService.getAllCompras(id);
  
      if (!compras) {
        return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
      }
  
      res.json(compras);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
};
