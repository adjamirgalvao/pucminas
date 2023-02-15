const UsuarioService = require("../services/UsuarioService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");

exports.get = async (req, res) => {
  let id = req.params.id;

  if (AutorizacaoService.isMesmoUsuario(req, id) || AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      const registro = await UsuarioService.getUsuariobyId(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

      res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.add = async (req, res) => {
  if (AutorizacaoService.isNovoUsuarioCliente(req.body) || AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    try {
      const registro = await UsuarioService.addUsuario(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  let mesmoUsuario = AutorizacaoService.isMesmoUsuario(req, id);
  let admin = AutorizacaoService.validarRoles(req, [ROLES.ADMIN]);

  if (mesmoUsuario || admin) {
    try {
      let usuario = {
        nome: req.body.nome,
        email: req.body.email,
      };

      //Só troca a senha se pedir para trocar a senha
      if (req.body.senha){
        usuario.senha = AutorizacaoService.criptografar(req.body.senha);
      }
      console.log('usuariosenha', usuario.senha, req.body.senha); 
      //Só troca as roles se for admin
      if (admin){
        usuario.roles = req.body.roles;
      }

      console.log(usuario, id);
      const registro = await UsuarioService.updateUsuario(id, usuario);

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
  if (AutorizacaoService.validarRoles(req, [ROLES.ADMIN])) {
    let id = req.params.id;

    try {
      const registro = await UsuarioService.deleteUsuario(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

