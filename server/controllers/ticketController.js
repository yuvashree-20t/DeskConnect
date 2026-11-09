

const Ticket = require("../models/Ticket");
const User = require("../models/User");

// 1. CREATE TICKET - Employee raises a support request
const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required."
            });
        }

        const ticket = await Ticket.create({
            title,
            description,
            category,
            priority,
            createdBy: req.user.userId
        });

        return res.status(201).json({
            message: "Ticket created successfully.",
            ticket
        });
    } catch (error) {
        console.error("Create Ticket Error:", error.message);
        return res.status(500).json({
            message: "Error creating ticket."
        });
    }
};


// 2. GET TICKETS
// Admin sees all tickets. Employee sees own tickets and assigned tickets.
const getAllTickets = async (req, res) => {
    try {
        const filter = req.user.role === "admin"
            ? {}
            : {
                $or: [
                    { createdBy: req.user.userId },
                    { assignedTo: req.user.userId }
                ]
            };

        const tickets = await Ticket.find(filter)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: tickets.length,
            tickets
        });
    } catch (error) {
        console.error("Get Tickets Error:", error.message);
        return res.status(500).json({
            message: "Error fetching tickets."
        });
    }
};


// 3. GET TICKET BY ID
const getTicketById = async (req, res) => {
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

        const ticket = await Ticket.findOne(filter)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found or access denied."
            });
        }

        return res.status(200).json({ ticket });
    } catch (error) {
        console.error("Get Ticket Error:", error.message);
        return res.status(500).json({
            message: "Error fetching ticket."
        });
    }
};


// 4. UPDATE TICKET - Admin only
const updateTicket = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only administrators can update support tickets."
            });
        }

        const allowedFields = [
            "status",
            "priority",
            "category",
            "assignedTo"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided."
            });
        }

        if (updates.assignedTo) {
            const employee = await User.findOne({
                _id: updates.assignedTo,
                role: "employee"
            });

            if (!employee) {
                return res.status(404).json({
                    message: "Employee not found."
                });
            }
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found."
            });
        }

        return res.status(200).json({
            message: "Ticket updated successfully.",
            ticket
        });
    } catch (error) {
        console.error("Update Ticket Error:", error.message);
        return res.status(500).json({
            message: "Error updating ticket."
        });
    }
};


// 5. ASSIGN TICKET - Admin only
const assignTicket = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only administrators can assign tickets."
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

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { assignedTo: employee._id },
            { new: true, runValidators: true }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found."
            });
        }

        return res.status(200).json({
            message: "Ticket assigned successfully.",
            ticket
        });
    } catch (error) {
        console.error("Assign Ticket Error:", error.message);
        return res.status(500).json({
            message: "Error assigning ticket."
        });
    }
};


// 6. DELETE TICKET
// Admin can delete any ticket. Employee can delete own ticket.
const deleteTicket = async (req, res) => {
    try {
        const filter = req.user.role === "admin"
            ? { _id: req.params.id }
            : {
                _id: req.params.id,
                createdBy: req.user.userId
            };

        const ticket = await Ticket.findOneAndDelete(filter);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found or access denied."
            });
        }

        return res.status(200).json({
            message: "Ticket deleted successfully."
        });
    } catch (error) {
        console.error("Delete Ticket Error:", error.message);
        return res.status(500).json({
            message: "Error deleting ticket."
        });
    }
};


module.exports = {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    assignTicket,
    deleteTicket
};
