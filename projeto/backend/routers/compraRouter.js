const express = require("express");
const router = express.Router();
const passport = require('passport');
const CompraController = require("../controllers/CompraController_");

//get
router.get("/", passport.authenticate('jwt', { session: false }), CompraController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), CompraController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), CompraController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), CompraController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), CompraController.delete);
//relatorio
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), CompraController.getRelatorioListagem);

module.exports = router;
