const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemVendaSchema = Schema({
  id_produto: {
    type: Schema.ObjectId,
    required: true
  },
  id_venda: {
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
  ItemVendaModel: mongoose.model("itensvendas", itemVendaSchema),
  Mongoose: mongoose,
};