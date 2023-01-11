const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const compraSchema = Schema({
  data: {
    type: Date,
    required: true,
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

module.exports = CompraModel = mongoose.model("compras", compraSchema);
