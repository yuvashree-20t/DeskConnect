
import User from "../models/User.js";
import Task from "../models/Task.js";
import Ticket from "../models/Ticket.js";

const testModels = async () => {
    try {
        // Test User Model
        const testUser = new User({
            name: "Test Employee",
            email: "test@deskconnect.com",
            password: "temporary-test-only",
            role: "employee"
        });

        await testUser.validate();
        console.log("User Model: Validation Successful!");

        // Test Task Model
        const testTask = new Task({
            title: "Complete Dashboard UI",
            description: "Build the employee dashboard",
            priority: "High",
            status: "In Progress",
            createdBy: testUser._id
        });

        await testTask.validate();
        console.log("Task Model: Validation Successful!");

        // Test Ticket Model
        const testTicket = new Ticket({
            title: "Internet Not Working",
            description: "Unable to connect to office Wi-Fi",
            category: "Network",
            priority: "Medium",
            status: "Open",
            createdBy: testUser._id
        });

        await testTicket.validate();
        console.log("Ticket Model: Validation Successful!");

        console.log("All Models Tested Successfully!");

    } catch (error) {
        console.error("Model Testing Failed:", error.message);
    }
};

testModels();
