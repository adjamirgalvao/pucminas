const express = require("express");
const router = express.Router();
const passport = require('passport');
const UsuarioController = require("../controllers/UsuarioController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), UsuarioController.getAll);
//post
router.post("/", passport.authenticate('jwt', { session: false }), UsuarioController.add);
//get
router.get("/:id", passport.authenticate('jwt', { session: false }), UsuarioController.get);
//put
router.put("/:id", passport.authenticate('jwt', { session: false }), UsuarioController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), UsuarioController.delete);

module.exports = router;
