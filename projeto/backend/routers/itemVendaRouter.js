const express = require("express");
const router = express.Router();
const passport = require('passport');
const ItemVendaController = require("../controllers/ItemVendaController_");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ItemVendaController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), ItemVendaController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), ItemVendaController.add);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ItemVendaController.delete);
//consultas
router.get("/consultas/produtosMaisVendidos", passport.authenticate('jwt', { session: false }), ItemVendaController.getProdutosMaisVendidos);

module.exports = router;
