
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    assignTicket,
    deleteTicket
} = require("../controllers/ticketController");

// All ticket routes require authentication
router.use(protect);

router.post("/", createTicket);
router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.patch("/:id/assign", assignTicket);
router.delete("/:id", deleteTicket);

module.exports = router;
