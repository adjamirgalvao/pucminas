const ItemVendaService = require("../services/ItemVendaService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const item = await ItemVendaService.getItemVendabyId(id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await ItemVendaService.getAllItensVendas();

    if (!registros) {
      return res.status(404).json("Não existem itens de vendas cadastradas!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await ItemVendaService.addItemVenda(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await ItemVendaService.deleteItemVenda(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
