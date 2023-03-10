const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendaSchema = Schema({
  data: {
    type: Date,
    required: true,
  },
  id_vendedor: {
    type: Schema.ObjectId,
    required: false
  },
  id_cliente: {
    type: Schema.ObjectId,
    required: false
  },  
});

module.exports = {
  VendaModel: mongoose.model("vendas", vendaSchema),
  Mongoose: mongoose,
};