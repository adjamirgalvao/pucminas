const VendedorService = require("../services/VendedorService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await VendedorService.getVendedorbyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await VendedorService.getAllVendedores();

    if (!registros) {
      return res.status(404).json("Não existem vendedores cadastrados!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await VendedorService.addVendedor(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const vendedor =  {
      nome: req.body.nome,
      cpf: req.body.cpf,
      email: req.body.email,
      salario: req.body.salario,
      endereco: req.body.endereco
  };

    console.log(vendedor, id);
    const registro = await VendedorService.updateVendedor(id, vendedor);

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
    const registro = await VendedorService.deleteVendedor(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
