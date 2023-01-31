const VendaService = require("../services/VendaService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await VendaService.getVendabyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await VendaService.getAllVendas();

    if (!registros) {
      return res.status(404).json("Não existem vendas cadastradas!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await VendaService.addVenda(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const venda = {};
    venda.data = req.body.data;
    venda.numero = req.body.numero;
    venda.id_vendedor = req.body.id_vendedor;
  
    console.log(venda, id);
    const registro = await VendaService.updateVenda(id, venda);

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
    const registro = await VendaService.deleteVenda(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllVendas = async (req, res) => {
    let id = req.params.id;

    try {
      const registros = await VendaService.getAllVendas(id);
  
      if (!registros) {
        return res.status(404).json(`Não existem vendas cadastradas para o produto ${id}!`);
      }
  
      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
};
