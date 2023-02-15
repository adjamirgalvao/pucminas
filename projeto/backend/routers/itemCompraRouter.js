const express = require("express");
const router = express.Router();
const passport = require('passport');
const ItemCompraController = require("../controllers/ItemCompraController_");

//get
router.get("/", passport.authenticate('jwt', { session: false }), ItemCompraController.getAll);
router.get("/:id", passport.authenticate('jwt', { session: false }), ItemCompraController.get);
//post
router.post("/", passport.authenticate('jwt', { session: false }), ItemCompraController.add);
//delete
router.delete("/:id", passport.authenticate('jwt', { session: false }), ItemCompraController.delete);

module.exports = router;
