const ItemVendaService = require("../services/ItemVendaService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.getProdutosMaisVendidos = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.GESTOR])) {
    if (!req.query.id_cliente || req.query.id_cliente.length == 24) {
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
      res.status(400).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};