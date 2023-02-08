const UsuarioService = require("../services/UsuarioService");
const jwt = require('jsonwebtoken');
const Config = require('../config/config');
const { AutorizacaoService } = require("../services/AutorizacaoService");

exports.login = async (req, res) => {
  try {
    let {login, senha} = req.body;
    const usuarios = await UsuarioService.find({login: login});

    if (usuarios && (usuarios.length == 1) && (usuarios[0].senha == AutorizacaoService.criptografar(senha))) {
          // Sign token
          const token = jwt.sign({ login }, Config.passport.secret, {
            expiresIn: Config.passport.expiresIn,
          });

          //https://stackoverflow.com/questions/23342558/why-cant-i-delete-a-mongoose-models-object-properties
          let retorno = {usuario: usuarios[0].toObject()};
          retorno.token = token;
          delete retorno.usuario.senha;
          res.status(200).json(retorno);
    } else {
      res.status(404).json({error: 'Usuario não encontrado.'});      
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

