const express = require("express");
const router = express.Router();
const passport = require('passport');
const ItemCompraController = require("../controllers/ItemCompraController");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ItemCompraController.getAll);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ItemCompraController.delete);

module.exports = router;
