const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const compraSchema = Schema({
  id_produto: {
    type: Schema.ObjectId,
    required: true
  },
  id_compra: {
    type: Schema.ObjectId,
    required: true
  },
  quantidade: {
    type: Number,
    required: true,
  },
  preco: {
    type: Number,
    required: true,
  }
});

module.exports = {
  CompraModel: mongoose.model("itensCompras", compraSchema),
  Mongoose: mongoose,
};