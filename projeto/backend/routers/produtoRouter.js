const express = require("express");
const router = express.Router();
const passport = require('passport');
const ProdutoController = require("../controllers/ProdutoController_");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ProdutoController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), ProdutoController.get);
router.get("/:id/listarItensCompras", passport.authenticate('jwt', { session: false }), ProdutoController.getAllItensCompras);
//post
router.post("/", passport.authenticate('jwt', { session: false }), ProdutoController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), ProdutoController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ProdutoController.delete);
//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), ProdutoController.getRelatorioListagem);

module.exports = router;
