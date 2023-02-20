const ItemCompraService = require("../services/ItemCompraService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    try {
      const registro = await ItemCompraService.getItemComprabyId(id);
      if (registro) {
        res.json(registro);
      } else {
        res.status(404).json({});        
      }  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      const registros = await ItemCompraService.getAllItensCompras();

      if (!registros) {
        return res.status(404).json("Não existem itens de compras cadastradas!");
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    try {
      const registro = await ItemCompraService.addItemCompra(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ESTOQUE, ROLES.ADMIN])) {
    let id = req.params.id;

    try {
      const registro = await ItemCompraService.deleteItemCompra(id);
      if (registro) {
        res.json(registro);
      } else {
        res.status(404).json({});        
      }  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};
