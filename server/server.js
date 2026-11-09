const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const taskRoutes = require("./routes/taskRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/employees", employeeRoutes);
// Test API route
app.get("/", (req, res) => {
    res.send("Welcome to DeskConnect Backend!");
});
// Protected API - JWT Authentication

app.get("/api/protected", protect, (req, res) => {

    res.status(200).json({
        message: "Access granted! Welcome to DeskConnect.",
        user: req.user
    });

});

// Server configuration
const PORT = process.env.PORT || 5000;

// Connect database and start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
