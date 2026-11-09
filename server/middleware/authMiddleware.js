
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    // Get token from request headers
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach employee information to request
        req.user = decoded;

        // Continue to next function
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }
};

module.exports = protect;
