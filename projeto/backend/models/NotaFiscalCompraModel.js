const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notaFiscalSchema = Schema({
  data: {
    type: Date,
    required: true,
  },
  numero: {
    type: String,
    required: false,
  },
});

module.exports = NotaFiscalCompraModel = mongoose.model("notasfiscaiscompra", notaFiscalSchema);