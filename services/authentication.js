require('dotenv').config(); // Load environment variables (needs to be first!)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Hash a plain text password before saving it to the DB
function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

// Check if a plain password matches a hashed password (for login)
async function checkPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Generate a JWT for a user (used for login sessions)
function generateJWT(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

// Middleware to protect private routes (must be logged in with a valid token)
function authenticateJWT(req, res, next) {
    const token = req.cookies['accessToken']; // Make sure client sets this cookie!
    if (token) {
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Token is invalid/expired
            }
            req.user = user; // Put user info from token on the request
            next();
        });
    } else {
        res.sendStatus(401); // No token—user not authenticated
    }
}

module.exports = {
    hashPassword,
    checkPassword,
    generateJWT,
    authenticateJWT
};
