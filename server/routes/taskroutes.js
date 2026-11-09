
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask
} = require("../controllers/task.Controller");

// Protect all task routes
router.use(protect);

// Task APIs
router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/assign", assignTask);

module.exports = router;
