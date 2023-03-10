const express = require("express");
const router = express.Router();
const passport = require('passport');
const ProdutoController = require("../controllers/ProdutoController.js");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ProdutoController.getAll);
//post
router.post("/", passport.authenticate('jwt', { session: false }), ProdutoController.add);
//put
router.put("/:id", passport.authenticate('jwt', { session: false }), ProdutoController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ProdutoController.delete);
router.get("/:id", passport.authenticate('jwt', { session: false }), ProdutoController.get);
router.get("/:id/listarItensCompras", passport.authenticate('jwt', { session: false }), ProdutoController.getAllItensCompras);
router.get("/:id/indicadoresCompras", passport.authenticate('jwt', { session: false }), ProdutoController.getIndicadoresCompras);
//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), ProdutoController.getRelatorioListagem);
//excel
router.get("/exportar/listagem", passport.authenticate('jwt', { session: false }), ProdutoController.getExcelListagem);

module.exports = router;
