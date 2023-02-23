const SHAJS = require("sha.js");

const ROLES = Object.freeze({
    ADMIN: 'ADMINISTRADOR',
    VENDEDOR: 'VENDEDOR',
    ESTOQUE: 'ESTOQUE',
    CLIENTE: 'CLIENTE',
    GESTOR: 'GESTOR',
});

class AutorizacaoService {
  static validarRoles = (req, roles) => {
  // https://stackoverflow.com/questions/9216185/nodejs-passport-display-username
    let usuario = req.user;
    let retorno = false;

    if (roles && roles.length > 0) {
     if (usuario && usuario.roles) {
       for (let i in roles) {
           retorno = retorno || usuario.roles.indexOf(roles[i]) > -1; 
        } 
      }   
    }  

   return retorno;
  };

  static isGestor = (req) => {
     return this.validarRoles(req, [ROLES.GESTOR]);
  };

  static isMesmoUsuario = (req, id) => {
    let usuario = req.user;

    return id == usuario._id;
  };
 
  static getEmail = (req) => {
    let usuario = req.user;
    let retorno = null;

    if (usuario) {
      retorno = usuario.email;
    }
    return retorno;
  }; 

  static isNovoUsuarioCliente = (body) => {
    let roles = body.roles;
    return (roles && (roles.length == 1) && (roles.indexOf(ROLES.CLIENTE) > -1));
  };

  static criptografar = (dado) => {
    return SHAJS('sha256').update(dado).digest('hex');
  };
}

module.exports = {
  AutorizacaoService: AutorizacaoService,
  ROLES: ROLES,
};
