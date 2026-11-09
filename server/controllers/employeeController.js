
const User = require("../models/User");
const Task = require("../models/Task");
const Ticket = require("../models/Ticket");

// GET ALL EMPLOYEES - Admin only
const getAllEmployees = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required."
            });
        }

        const employees = await User.find({ role: "employee" })
            .select("name email role createdAt")
            .sort({ createdAt: -1 });

        const employeeData = await Promise.all(
            employees.map(async (employee) => {
                const [taskCount, ticketCount] = await Promise.all([
                    Task.countDocuments({ assignedTo: employee._id }),
                    Ticket.countDocuments({ createdBy: employee._id })
                ]);

                return {
                    ...employee.toObject(),
                    taskCount,
                    ticketCount
                };
            })
        );

        return res.status(200).json({
            count: employeeData.length,
            employees: employeeData
        });

    } catch (error) {
        console.error("Get Employees Error:", error.message);

        return res.status(500).json({
            message: "Error fetching employees."
        });
    }
};

module.exports = { getAllEmployees };
