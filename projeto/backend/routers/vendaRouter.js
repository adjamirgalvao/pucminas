const express = require("express");
const router = express.Router();
const passport = require('passport');
const VendaController = require("../controllers/VendaController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), VendaController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), VendaController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), VendaController.add);
//put
router.put("/:id", passport.authenticate('jwt', { session: false }), VendaController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), VendaController.delete);
//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), VendaController.getRelatorioListagem);
//excel
router.get("/exportar/listagem", passport.authenticate('jwt', { session: false }), VendaController.getExcelListagem);
//indicador
router.get("/consultas/indicadoresVendas", passport.authenticate('jwt', { session: false }), VendaController.getIndicadoresVendas);
//consulta
router.get("/consultas/produtosMaisVendidos", passport.authenticate('jwt', { session: false }), VendaController.getProdutosMaisVendidos);

module.exports = router;
