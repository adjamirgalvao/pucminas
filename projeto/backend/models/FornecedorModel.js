const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fornecedorSchema = Schema({
  nome: {
    type: String,
    required: true,
  },
  tipo: {
    type: string,
    required: true,
  },
  identificacao: {
    type: Number,
    required: true,
  },
  endereco: {
     rua: {
       type: Number,
       required: true,
     },  
     numero: {
       type: Number,
       required: true,
     },
     complemento: {
      type: string,
      required: true,
    }
}
});

module.exports = FornecedorModel = mongoose.model("fornecedores", fornecedorSchema);