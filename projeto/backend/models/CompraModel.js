const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const compraSchema = Schema({
  data: {
    type: Date,
    required: true,
  },
  numero: {
    type: String,
    required: false,
  },
});

module.exports = CompraModel = mongoose.model("compras", compraSchema);