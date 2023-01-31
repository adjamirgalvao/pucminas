const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendedorSchema = Schema({
  nome: {
    type: String,
    required: true,
  },
  cpf: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  salario: {
    type: Number,
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

module.exports = VendedorModel = mongoose.model("vendedores", vendedorSchema);