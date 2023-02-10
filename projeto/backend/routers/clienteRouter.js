const express = require("express");
const router = express.Router();
const passport = require('passport');
const ClienteController = require("../controllers/ClienteController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ClienteController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), ClienteController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), ClienteController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), ClienteController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ClienteController.delete);
router.get("/relatorios/listagem", passport.authenticate('jwt', { session: false }), ClienteController.getRelatorioListagem);

module.exports = router;
