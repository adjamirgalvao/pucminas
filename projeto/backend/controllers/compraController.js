const CompraService = require("../services/CompraService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await CompraService.getComprabyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await CompraService.getAllCompras();

    if (!registros) {
      return res.status(404).json("Não existem compras cadastradas!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await CompraService.addCompra(req.body);
    res.status(201).json(registro);
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
    const registro = await CompraService.updateCompra(id, compra);

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
    const registro = await CompraService.deleteCompra(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCompras = async (req, res) => {
    let id = req.params.id;

    try {
      const registros = await CompraService.getAllCompras(id);
  
      if (!registros) {
        return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
      }
  
      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
};
