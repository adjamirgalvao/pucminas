const UsuarioService = require("../services/UsuarioService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.get = async (req, res) => {
  let id = req.params.id;

  if (AutorizacaoService.isMesmoUsuario(req, id) || AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    if (id.length == 24) {
      try {
        const registro = await UsuarioService.getUsuariobyId(id);
        if (registro) {
          let retorno = registro.toObject();
          delete retorno.senha;
          res.json(retorno);
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.getAll = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      const registros = await UsuarioService.getAllUsuarios();

      if (!registros) {
        return res.status(404).json("Não existem usuarios cadastrados!");
      }
      let retorno;
      //removendo a senha do retorno
      if (Array.isArray(registros)) {
        retorno = registros.map(item => {
          const { senha, ...dataWithoutSenha } = item.toObject();
          return { ...dataWithoutSenha };
        });
      } else {
        const { senha, ...dataWithoutSenha } = registros.toObject();
        retorno = dataWithoutSenha;
      }
      res.json(retorno);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.add = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      const registro = await UsuarioService.addUsuario(req.body);
      let retorno = registro.toObject();
      delete retorno.senha;
      res.status(201).json(retorno);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};


exports.registrar = async (req, res) => {
  const novo = {
    nome: req.body.nome,
    login: req.body.login,
    email: req.body.email,
    senha: req.body.senha,
    roles: [ROLES.CLIENTE],
  };

  try {
    const registro = await UsuarioService.addUsuario(novo);
    let retorno = registro.toObject();
    delete retorno.senha;
    res.status(201).json(retorno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  let mesmoUsuario = AutorizacaoService.isMesmoUsuario(req, id);
  let admin = AutorizacaoService.validarRoles(req, [ROLES.ADMIN]);

  if (mesmoUsuario || admin) {
    if (id.length == 24) {
      try {
        let usuario = {
          nome: req.body.nome,
          email: req.body.email,
        };

        //Só troca a senha se pedir para trocar a senha
        if (req.body.senha) {
          usuario.senha = AutorizacaoService.criptografar(req.body.senha);
        }
        //Só troca as roles se for admin
        if (admin) {
          usuario.roles = req.body.roles;
        }

        const registro = await UsuarioService.updateUsuario(id, usuario);

        if (registro.modifiedCount === 0) {
          return res.status(404).json({});
        }

        res.json(registro);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.delete = async (req, res) => {
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    let id = req.params.id;

    if (id.length == 24) {
      try {
        const registro = await UsuarioService.deleteUsuario(id);
        if (registro) {
          let retorno = registro.toObject();
          delete retorno.senha;
          res.json(retorno);
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

