const VendedorService = require("../services/VendedorService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.get = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await VendedorService.getVendedorbyId(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }  
};

exports.getByEmail = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.MASTER])) {
    let email = req.params.email;

    try {
      const registro = await VendedorService.getVendedorbyEmail(email);
      if (registro) {
        res.json(registro);
      } else {
        res.status(404).json({ error: 'Vendedor não encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }  
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN, ROLES.MASTER])) {
    try {
      const registros = await VendedorService.getAllVendedores();

      if (!registros) {
        return res.status(404).json("Não existem vendedores cadastrados!");
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
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN, ROLES.MASTER])) {
    try {
      const registro = await VendedorService.addVendedor(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }  
};

exports.update = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN, ROLES.MASTER])) {
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
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }  
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN, ROLES.MASTER])) {
    let id = req.params.id;

    try {
      const registro = await VendedorService.deleteVendedor(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }  
};
