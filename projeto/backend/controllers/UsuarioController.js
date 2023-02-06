const UsuarioService = require("../services/UsuarioService");
const jwt = require('jsonwebtoken');
const Config = require('../config/config');

exports.get = async (req, res) => {
  let id = req.params.id;

  try {
    const registro = await UsuarioService.getUsuariobyId(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  // https://stackoverflow.com/questions/9216185/nodejs-passport-display-username
  console.log('username', req.user);
  try {
    const registros = await UsuarioService.getAllUsuarios();

    if (!registros) {
      return res.status(404).json("Não existem usuarios cadastrados!");
    }

    res.json(registros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const registro = await UsuarioService.addUsuario(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  let id = req.params.id;

  try {
    const usuario =  {
      nome: req.body.nome,
      login: req.body.cpf,
      email: req.body.email,
      senha: req.body.senha,
      roles: req.body.roles
  };

    console.log(usuario, id);
    const registro = await UsuarioService.updateUsuario(id, usuario);

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
    const registro = await UsuarioService.deleteUsuario(id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    let {login, senha} = req.body;
    const usuarios = await UsuarioService.find({login: login});

    if (usuarios && (usuarios.length == 1) && (usuarios[0].senha == senha)) {
          // Sign token
          const token = jwt.sign({ login }, Config.passport.secret, {
            expiresIn: Config.passport.expiresIn,
          });

          //https://stackoverflow.com/questions/23342558/why-cant-i-delete-a-mongoose-models-object-properties
          let retorno = {usuario: usuarios[0].toObject()};
          retorno.token = token;
          delete retorno.usuario.senha;
          delete retorno.usuario._id;
          res.status(200).json(retorno);
    } else {
      res.status(404).json({error: 'Usuario não encontrado'});      
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};
