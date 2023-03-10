const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemCompraSchema = Schema({
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
  ItemCompraModel: mongoose.model("itenscompras", itemCompraSchema),
  Mongoose: mongoose,
};