const FornecedorService = require("../services/FornecedorService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await FornecedorService.getFornecedorbyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await FornecedorService.getAllFornecedores();

    if (!registros) {
      return res.status(404).json("Não existem fornecedores cadastrados!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await FornecedorService.addFornecedor(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const fornecedor =  {
      nome: req.body.nome,
      tipo: req.body.tipo,
      identificacao: req.body.identificacao,
      endereco: req.body.endereco
  };

    console.log(fornecedor, id);
    const registro = await FornecedorService.updateFornecedor(id, fornecedor);

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
    const registro = await FornecedorService.deleteFornecedor(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
