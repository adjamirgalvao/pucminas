const ROLES = Object.freeze({
    ADMIN: 'ADMINISTRADOR',
    VENDEDOR: 'VENDEDOR',
    ESTOQUE: 'ESTOQUE',
    CLIENTE: 'CLIENTE',
    MASTER: 'MASTER',
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

  static isMesmoUsuario= (req, id) => {
    let usuario = req.user;
    console.log('mesmo usuario', id,usuario._id, id == usuario._id);

    return id == usuario._id;
  };

  static isNovoUsuarioCliente= (body) => {
    let roles = body.roles;
    return (roles && (roles.length == 1) && (usuario.roles.indexOf(ROLES.CLIENTE) > -1));
  };
}

module.exports = {
  AutorizacaoService: AutorizacaoService,
  ROLES: ROLES,
};
