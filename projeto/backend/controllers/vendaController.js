const VendaService = require("../services/VendaService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await VendaService.getVendabyId(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    try {
      const registros = await VendaService.getAllVendas();

      if (!registros) {
        return res.status(404).json("Não existem vendas cadastradas!");
      }

      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.add = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    try {
      const registro = await VendaService.addVenda(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.update = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
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
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await VendaService.deleteVenda(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAllVendas = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.MASTER])) {
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
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};
