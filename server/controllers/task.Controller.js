
const Task = require("../models/Task");
const User = require("../models/User");

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            assignedTo,
            dueDate
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Task title is required."
            });
        }

        // Employees cannot assign tasks to other employees.
        if (assignedTo && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only administrators can assign tasks."
            });
        }

        if (assignedTo) {
            const employee = await User.findOne({
                _id: assignedTo,
                role: "employee"
            });

            if (!employee) {
                return res.status(404).json({
                    message: "Employee not found."
                });
            }
        }

        const task = await Task.create({
            title,
            description,
            priority,
            createdBy: req.user.userId,
            assignedTo: assignedTo || null,
            dueDate: dueDate || null
        });

        return res.status(201).json({
            message: "Task created successfully.",
            task
        });
    } catch (error) {
        console.error("Create Task Error:", error.message);
        return res.status(500).json({
            message: "Server error while creating task."
        });
    }
};

// GET TASKS
// Admin sees all; employee sees created or assigned tasks.

const getAllTasks = async (req, res) => {
    try {
        const filter = req.user.role === "admin"
            ? {}
            : {
                $or: [
                    { createdBy: req.user.userId },
                    { assignedTo: req.user.userId }
                ]
            };

        const tasks = await Task.find(filter)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: tasks.length,
            tasks
        });

    } catch (error) {
        console.error("Get Tasks Error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching tasks"
        });
    }
};


// GET ONE TASK
const getTaskById = async (req, res) => {
    try {
        const filter = req.user.role === "admin"
            ? { _id: req.params.id }
            : {
                _id: req.params.id,
                $or: [
                    { createdBy: req.user.userId },
                    { assignedTo: req.user.userId }
                ]
            };

        const task = await Task.findOne(filter)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role");

        if (!task) {
            return res.status(404).json({
                message: "Task not found or access denied."
            });
        }

        return res.status(200).json({ task });
    } catch (error) {
        console.error("Get Task Error:", error.message);
        return res.status(500).json({
            message: "Server error while fetching task."
        });
    }
};

// UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        const isAdmin = req.user.role === "admin";
        const userId = req.user.userId.toString();
        const isCreator = task.createdBy.toString() === userId;
        const isAssignee = task.assignedTo?.toString() === userId;

        if (!isAdmin && !isCreator && !isAssignee) {
            return res.status(403).json({
                message: "You do not have permission to update this task."
            });
        }

        if (!isAdmin) {
            // Employees may only update the status of tasks
            // assigned to them.
            if (req.body.status !== undefined) {
                if (!isAssignee) {
                    return res.status(403).json({
                        message: "Only the assigned employee can update task status."
                    });
                }

                task.status = req.body.status;
            }

            // The task creator can edit basic task details.
            if (isCreator) {
                const fields = [
                    "title",
                    "description",
                    "priority",
                    "dueDate"
                ];

                fields.forEach((field) => {
                    if (req.body[field] !== undefined) {
                        task[field] = req.body[field];
                    }
                });
            }

            // Reject assignment attempts from employees.
            if (req.body.assignedTo !== undefined) {
                return res.status(403).json({
                    message: "Only administrators can assign tasks."
                });
            }
        } else {
            const fields = [
                "title",
                "description",
                "priority",
                "status",
                "dueDate"
            ];

            fields.forEach((field) => {
                if (req.body[field] !== undefined) {
                    task[field] = req.body[field];
                }
            });
        }

        await task.save();

        return res.status(200).json({
            message: "Task updated successfully.",
            task
        });
    } catch (error) {
        console.error("Update Task Error:", error.message);
        return res.status(400).json({
            message: "Could not update task. Check the supplied values."
        });
    }
};

// DELETE TASK
// Admin can delete any task; employee can delete a task they created.
const deleteTask = async (req, res) => {
    try {
        const filter = req.user.role === "admin"
            ? { _id: req.params.id }
            : {
                _id: req.params.id,
                createdBy: req.user.userId
            };

        const task = await Task.findOneAndDelete(filter);

        if (!task) {
            return res.status(404).json({
                message: "Task not found or you cannot delete it."
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully."
        });
    } catch (error) {
        console.error("Delete Task Error:", error.message);
        return res.status(500).json({
            message: "Server error while deleting task."
        });
    }
};

// ASSIGN TASK — admin only
const assignTask = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only administrators can assign tasks."
            });
        }

        const { assignedTo } = req.body;

        if (!assignedTo) {
            return res.status(400).json({
                message: "Employee ID is required."
            });
        }

        const employee = await User.findOne({
            _id: assignedTo,
            role: "employee"
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { assignedTo: employee._id },
            {
                new: true,
                runValidators: true
            }
        )
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        return res.status(200).json({
            message: "Task assigned successfully.",
            task
        });
    } catch (error) {
        console.error("Assign Task Error:", error.message);
        return res.status(500).json({
            message: "Server error while assigning task."
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask
};
