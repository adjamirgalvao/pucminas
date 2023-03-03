const Config = require('../config/config');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const client = new OAuth2Client(Config.GOOGLE_CLIENT_ID);
const UsuarioService = require("../services/UsuarioService");
const { AutorizacaoService, ROLES } = require("../services/AutorizacaoService");


function gerarToken(login) {
  return jwt.sign({ login }, Config.PASSPORT.SECRET, { expiresIn: Config.PASSPORT.EXPIRESIN, });
}

exports.login = async (req, res) => {
  try {
    let { login, senha } = req.body;
    const usuario = await UsuarioService.findOne({ login: login });

    if (senha && usuario && (usuario.senha == AutorizacaoService.criptografar(senha))) {
      // Sign token
      const token = gerarToken(login);

      //https://stackoverflow.com/questions/23342558/why-cant-i-delete-a-mongoose-models-object-properties
      let retorno = { usuario: usuario.toObject() };
      retorno.token = token;
      delete retorno.usuario.senha;
      res.status(200).json(retorno);
    } else {
      res.status(404).json({ error: 'Usuario não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//https://medium.com/@kishore8497/google-authentication-using-angular-and-nodejs-86b76a72ee80
exports.loginGoogle = async (req, res) => {
  try {
    let usuario = null;
    let token = null;

    const ticket = await client.verifyIdToken({
      idToken : req.body.idToken,
      audience : Config.GOOGLE_CLIENT_ID
      });
    const payload = ticket.getPayload();    
    // Consultando para ver se tem um usuário cadastrado
    const usuarios = await UsuarioService.find({ email: payload.email });
    if (usuarios && usuarios.length == 0) {
      // Se não tem cadastra
      const novo = {
        nome: payload.name,
        login: payload.email,
        email: payload.email,
        senha: '' + (Math.floor(Math.random() * Date.now())), //senha aleatória
        roles: [ROLES.CLIENTE],
      };

      usuario = await UsuarioService.addUsuario(novo);
    } else if (usuarios && (usuarios.length == 1)) {

      //https://stackoverflow.com/questions/23342558/why-cant-i-delete-a-mongoose-models-object-properties
      usuario = usuarios[0];
    }
    if (usuario) {
      // Sign token
      token = gerarToken(usuario.login);

      let retorno = { usuario: usuario.toObject() };
      retorno.token = token;
      delete retorno.usuario.senha;
      res.status(200).json(retorno);
    } else {
      res.status(404).json({ error: 'Não foi possível efetuar o login pelo Google.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};


