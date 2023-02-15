const express = require("express");
const router = express.Router();
const passport = require('passport');
const FornecedorController = require("../controllers/FornecedorController_");

//get
router.get("/", passport.authenticate('jwt', { session: false }), FornecedorController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), FornecedorController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), FornecedorController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), FornecedorController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), FornecedorController.delete);
//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), FornecedorController.getRelatorioListagem);

module.exports = router;
