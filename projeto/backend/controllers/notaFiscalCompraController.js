const NotaFiscalCompraService = require("../services/NotaFiscalCompraService");

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const notaFiscal = await NotaFiscalCompraService.getNotaFiscalComprabyId(id);
    res.json(notaFiscal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const notasFiscais = await NotaFiscalCompraService.getAllNotaFiscalCompras();

    if (!notasFiscais) {
      return res.status(404).json("Não existem notas fiscais de compra cadastradas!");
    }

    res.json(notasFiscais);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const createdNota = await NotaFiscalCompraService.addNotaFiscalCompra(req.body);
    res.status(201).json(createdNota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const nota = {};
    nota.data = req.body.data;
    nota.numero = req.body.numero;

    console.log(nota, id);
    const updatedNota = await NotaFiscalCompraService.updateNotaFiscalCompra(id, nota);

    if (updatedNota.nModified === 0) {
      return res.status(404).json({});
    }

    res.json(updatedNota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  let id = req.params.id;

  try {
    const deleteResponse = await NotaFiscalCompraService.deleteNotaFiscalCompra(id);
    res.json(deleteResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCompras = async (req, res) => {
    let id = req.params.id;

    try {
      const compras = await NotaFiscalCompraService.getAllCompras(id);
  
      if (!compras) {
        return res.status(404).json(`Não existem compras cadastradas para o produto ${id}!`);
      }
  
      res.json(compras);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
};
