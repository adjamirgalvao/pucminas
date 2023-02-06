const express = require("express");
const router = express.Router();
const passport = require('passport');
const ItemVendaController = require("../controllers/ItemVendaController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ItemVendaController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), ItemVendaController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), ItemVendaController.add);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ItemVendaController.delete);

module.exports = router;
