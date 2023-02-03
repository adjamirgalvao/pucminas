const express = require("express");
const router = express.Router();
const FornecedorController = require("../controllers/FornecedorController");

//get
router.get("/", FornecedorController.getAll);
router.get("/:id", FornecedorController.get);
//post
router.post("/", FornecedorController.add);
//update
router.put("/:id", FornecedorController.update);
//delete
router.delete("/:id", FornecedorController.delete);

module.exports = router;
