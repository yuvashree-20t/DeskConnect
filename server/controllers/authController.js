
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Employee Registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        // Check whether employee already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create employee
        const newUser = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: "employee"
        });

        return res.status(201).json({
            message: "Employee registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration Error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            message: "Server error during registration"
        });
    }
};


// Employee Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find employee
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Verify JWT configuration
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Authentication configuration error"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};

// Export controller functions
module.exports = {
    registerUser,
    loginUser
};
