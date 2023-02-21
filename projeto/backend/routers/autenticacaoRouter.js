const express = require("express");
const router = express.Router();
const AutorizacaoController = require("../controllers/AutorizacaoController");
const UsuarioController = require("../controllers/UsuarioController");

//login
router.post("/login", AutorizacaoController.login);
router.post("/loginGoogle", AutorizacaoController.loginGoogle);
//registrar
router.post("/registrar", UsuarioController.registrar);

module.exports = router;
