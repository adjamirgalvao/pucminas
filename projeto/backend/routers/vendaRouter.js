const express = require("express");
const router = express.Router();
const vendaController = require("../controllers/vendaController");

//get
router.get("/", vendaController.getAll);
router.get("/:id", vendaController.get);
//post
router.post("/", vendaController.add);
//update
router.put("/:id", vendaController.update);
//delete
router.delete("/:id", vendaController.delete);

module.exports = router;
