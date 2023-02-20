const express = require("express");
const router = express.Router();
const passport = require('passport');
const ItemCompraController = require("../controllers/ItemCompraController");

//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ItemCompraController.delete);

module.exports = router;
