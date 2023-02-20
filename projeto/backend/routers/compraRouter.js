const express = require("express");
const router = express.Router();
const passport = require('passport');
const CompraController = require("../controllers/CompraController");
const ItemCompraController = require("../controllers/ItemCompraController");


//get
router.get("/", passport.authenticate('jwt', { session: false }), CompraController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), CompraController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), CompraController.add);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), CompraController.delete);
router.delete("/:idCompra/itensCompra/:id", passport.authenticate('jwt', { session: false }), ItemCompraController.delete);

//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), CompraController.getRelatorioListagem);
//excel
router.get("/exportar/listagem", passport.authenticate('jwt', { session: false }), CompraController.getExcelListagem);

module.exports = router;
