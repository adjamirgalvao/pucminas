const express = require("express");
const router = express.Router();
const passport = require('passport');
const VendaController = require("../controllers/vendaController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), VendaController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), VendaController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), VendaController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), VendaController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), VendaController.delete);

module.exports = router;
