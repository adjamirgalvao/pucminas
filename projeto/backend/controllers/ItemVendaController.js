const ItemVendaService = require("../services/ItemVendaService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    let id = req.params.id;

    try {
      const item = await ItemVendaService.getItemVendabyId(id);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    try {
      const registros = await ItemVendaService.getAllItensVendas();

      if (!registros) {
        return res.status(404).json("Não existem itens de vendas cadastradas!");
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
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    try {
      const registro = await ItemVendaService.addItemVenda(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN])) {
    let id = req.params.id;

    try {
      const registro = await ItemVendaService.deleteItemVenda(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getProdutosMaisVendidos = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.GESTOR])) {
    try {
      const registros = await ItemVendaService.getProdutosMaisVendidos(req.query.ano, req.query.id_cliente);

      if (!registros) {
        return res.status(404).json("Não existem itens de vendas cadastradas!");
      }

      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};