const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clienteSchema = Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },  
  cpf: {
    type: String,
    required: true,
  },
  dataNascimento: {
    type: String,
    required: true,
  },
  endereco: {
     rua: {
       type: String,
       required: true,
     },  
     numero: {
       type: String,
       required: true,
     },
     complemento: {
      type: String,
      required: false,
    }
}
});

module.exports = ClienteModel = mongoose.model("clientes", clienteSchema);