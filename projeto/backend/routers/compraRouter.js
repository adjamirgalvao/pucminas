const express = require("express");
const router = express.Router();
const passport = require('passport');
const CompraController = require("../controllers/CompraController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), CompraController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), CompraController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), CompraController.add);
//update
router.put("/:id", passport.authenticate('jwt', { session: false }), CompraController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), CompraController.delete);

module.exports = router;
