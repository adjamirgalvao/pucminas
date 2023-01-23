const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fornecedorSchema = Schema({
  nome: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    required: true,
  },
  identificacao: {
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

module.exports = FornecedorModel = mongoose.model("fornecedores", fornecedorSchema);