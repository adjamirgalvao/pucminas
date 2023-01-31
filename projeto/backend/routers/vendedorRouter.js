const express = require("express");
const router = express.Router();
const VendedorController = require("../controllers/vendedorController");

//get
router.get("/", VendedorController.getAll);
router.get("/:id", VendedorController.get);
//post
router.post("/", VendedorController.add);
//update
router.put("/:id", VendedorController.update);
//delete
router.delete("/:id", VendedorController.delete);

module.exports = router;
