const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usuarioSchema = Schema({
  nome: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
  },
  senha: {
    type: String,
    required: true,
  },  
  email: {
    type: String,
    required: true,
  },  
  roles: [{
    type: String,
    required: true
  }],
});

module.exports = UsuariorModel = mongoose.model("usuarios", usuarioSchema);