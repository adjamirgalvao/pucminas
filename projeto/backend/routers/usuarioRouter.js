const express = require("express");
const router = express.Router();
const passport = require('passport');

const UsuarioController = require("../controllers/UsuarioController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), UsuarioController.getAll);
router.get("/:id", UsuarioController.get);
//post
router.post("/", UsuarioController.add);
//update
router.put("/:id", UsuarioController.update);
//delete
router.delete("/:id", UsuarioController.delete);
//login
router.post("/login", UsuarioController.login);

module.exports = router;
