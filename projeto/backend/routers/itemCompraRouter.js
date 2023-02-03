const express = require("express");
const router = express.Router();
const ItemCompraController = require("../controllers/ItemCompraController");

//get
router.get("/", ItemCompraController.getAll);
router.get("/:id", ItemCompraController.get);
//post
router.post("/", ItemCompraController.add);
//delete
router.delete("/:id", ItemCompraController.delete);

module.exports = router;
