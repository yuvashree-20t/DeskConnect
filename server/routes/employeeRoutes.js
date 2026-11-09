
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { getAllEmployees } = require("../controllers/employeeController");

router.use(protect);

router.get("/", getAllEmployees);

module.exports = router;
