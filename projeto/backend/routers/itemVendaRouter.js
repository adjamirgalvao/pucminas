const express = require("express");
const router = express.Router();
const passport = require('passport');
const ItemVendaController = require("../controllers/ItemVendaController");

//consultas
router.get("/consultas/produtosMaisVendidos", passport.authenticate('jwt', { session: false }), ItemVendaController.getProdutosMaisVendidos);

module.exports = router;
