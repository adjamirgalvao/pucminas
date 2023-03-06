const { Strategy, ExtractJwt } = require('passport-jwt');
const UsuarioModel = require("../models/UsuarioModel");
const Config = require('../config/config');

//https://dev.to/calvinqc/a-step-by-step-guide-to-setting-up-a-node-js-api-with-passport-jwt-5fa5
exports.applyPassportStrategy = (passport) => {
  const options = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = Config.PASSPORT.SECRET;
  passport.use(
    new Strategy(options, (payload, done) => {
        UsuarioModel.find({ login: payload.usuario.login }, (err, usuarios) => {
        if (err) {
          return done(err, false);
        } else if (usuarios && (usuarios.length == 1)) {
          return done(null, {
            _id: usuarios[0]._id,
            email: usuarios[0].email,
            login: usuarios[0].login,
            nome: usuarios[0].nome,
            roles: usuarios[0].roles,
          });
        } else {
          return done(null, false);
        } 
      });
    })
  );
};