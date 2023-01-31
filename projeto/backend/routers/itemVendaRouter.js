const express = require("express");
const router = express.Router();
const ItemVendaController = require("../controllers/itemVendaController");

//get
router.get("/", ItemVendaController.getAll);
router.get("/:id", ItemVendaController.get);
//post
router.post("/", ItemVendaController.add);
//delete
router.delete("/:id", ItemVendaController.delete);

module.exports = router;
