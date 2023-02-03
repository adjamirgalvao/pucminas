const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/ClienteController");

//get
router.get("/", ClienteController.getAll);
router.get("/:id", ClienteController.get);
//post
router.post("/", ClienteController.add);
//update
router.put("/:id", ClienteController.update);
//delete
router.delete("/:id", ClienteController.delete);

module.exports = router;
