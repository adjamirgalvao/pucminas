const express = require("express");
const router = express.Router();
const notaFiscalCompra = require("../controllers/notaFiscalCompraController");

//get
router.get("/", notaFiscalCompra.getAll);
router.get("/:id", notaFiscalCompra.get);
//post
router.post("/", notaFiscalCompra.add);
//update
router.put("/:id", notaFiscalCompra.update);
//delete
router.delete("/:id", notaFiscalCompra.delete);

module.exports = router;
