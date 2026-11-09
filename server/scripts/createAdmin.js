
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
    try {
        if (
            !process.env.MONGO_URI ||
            !process.env.ADMIN_NAME ||
            !process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_PASSWORD
        ) {
            throw new Error(
                "Please configure MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env"
            );
        }

        if (process.env.ADMIN_PASSWORD.length < 8) {
            throw new Error("Admin password must contain at least 8 characters.");
        }

        await mongoose.connect(process.env.MONGO_URI);

        const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

        let admin = await User.findOne({ email });

        if (admin) {
            admin.name = process.env.ADMIN_NAME.trim();
            admin.role = "admin";
            admin.password = await bcrypt.hash(
                process.env.ADMIN_PASSWORD,
                10
            );
            await admin.save();

            console.log("Existing account successfully promoted to Admin.");
        } else {
            admin = await User.create({
                name: process.env.ADMIN_NAME.trim(),
                email,
                password: await bcrypt.hash(
                    process.env.ADMIN_PASSWORD,
                    10
                ),
                role: "admin"
            });

            console.log("Admin account created successfully.");
        }

        console.log("Admin email:", admin.email);
        console.log("Admin role:", admin.role);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
