const express = require("express");
const router = express.Router();
const passport = require('passport');
const UsuarioController = require("../controllers/UsuarioController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), UsuarioController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), UsuarioController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), UsuarioController.add);
//post
router.post("/registrar", UsuarioController.add);
//post
router.put("/:id", passport.authenticate('jwt', { session: false }), UsuarioController.update);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), UsuarioController.delete);

module.exports = router;
