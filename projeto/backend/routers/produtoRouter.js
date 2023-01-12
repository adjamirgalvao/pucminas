const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");

//get
router.get("/", produtoController.getAll);
router.get("/:id", produtoController.get);
router.get("/:id/listarCompras", produtoController.getAllCompras);
//post
router.post("/", produtoController.add);
//update
router.put("/:id", produtoController.update);
//delete
router.delete("/:id", produtoController.delete);

module.exports = router;
