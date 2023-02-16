const express = require("express");
const router = express.Router();
const passport = require('passport');
const VendedorController = require("../controllers/VendedorController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), VendedorController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), VendedorController.get);
router.get("/email/:email", passport.authenticate('jwt', { session: false }), VendedorController.getByEmail);
//post
router.post("/", passport.authenticate('jwt', { session: false }), VendedorController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), VendedorController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), VendedorController.delete);
//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), VendedorController.getRelatorioListagem);
//excel
router.get("/exportar/listagem", passport.authenticate('jwt', { session: false }), VendedorController.getExcelListagem);

module.exports = router;
