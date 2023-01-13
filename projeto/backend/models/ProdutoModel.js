const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const produtoSchema = Schema({
  nome: {
    type: String,
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
  },
  preco: {
    type: Number,
    required: true,
  },
  precoCusto: {
    type: Number,
    required: true,
  },  
  precoCustoInicial: {
    type: Number,
    required: true,
  }
});

module.exports = ProdutoModel = mongoose.model("produtos", produtoSchema);