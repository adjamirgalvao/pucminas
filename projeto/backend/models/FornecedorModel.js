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
    type: Number,
    required: true,
  },
  endereco: {
     rua: {
       type: String,
       required: true,
     },  
     numero: {
       type: Number,
       required: true,
     },
     complemento: {
      type: String,
      required: true,
    }
}
});

module.exports = FornecedorModel = mongoose.model("fornecedores", fornecedorSchema);