const ClienteService = require("../services/ClienteService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await ClienteService.getClientebyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const registros = await ClienteService.getAllClientes();

    if (!registros) {
      return res.status(404).json("Não existem clientes cadastrados!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await ClienteService.addCliente(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const cliente =  {
      nome: req.body.nome,
      dataNascimento: req.body.dataNascimento,
      cpf: req.body.cpf,
      endereco: req.body.endereco
  };

    console.log(cliente, id);
    const registro = await ClienteService.updateCliente(id, cliente);

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
    const registro = await ClienteService.deleteCliente(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
