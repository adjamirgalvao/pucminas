const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compraController");

//get
router.get("/", compraController.getAll);
router.get("/:id", compraController.get);
//post
router.post("/", compraController.add);
//update
router.put("/:id", compraController.update);
//delete
router.delete("/:id", compraController.delete);

module.exports = router;
