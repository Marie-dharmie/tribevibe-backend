const usersModel = require('../models/usersModel');
const { checkPassword, generateJWT } = require('../services/authentication');

// Register a new user (handles file upload for profile pic)
function register(req, res) {
    const { username, email, password, bio } = req.body;
    const profile_picture = req.file ? req.file.filename : null;
    usersModel.createUser({ username, email, password, bio, profile_picture }, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Registration failed', details: err });
        } else {
            res.json({
                message: 'Registration successful!',
                userId: result.insertId,
                profile_picture: profile_picture ? `/uploads/${profile_picture}` : null
            });
        }
    });
}

// Get all users from the database
function getAllUsers(req, res) {
    usersModel.getAllUsers((err, users) => {
        if (err) res.status(500).json({ error: err });
        else res.json(users);
    });
}

// Get a single user by ID
function getUserById(req, res) {
    const id = req.params.id;
    usersModel.getUserById(id, (err, user) => {
        if (err) res.status(500).json({ error: err });
        else res.json(user);
    });
}

// Create a new user (admin use, no file upload)
function createUser(req, res) {
    usersModel.createUser(req.body, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "User created!", userId: result.insertId });
    });
}

// Edit/update user data
function updateUser(req, res) {
    const id = req.params.id;
    usersModel.updateUser(id, req.body, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "User updated!" });
    });
}

// Delete a user (by ID)
function deleteUser(req, res) {
    const id = req.params.id;
    usersModel.deleteUser(id, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "User deleted!" });
    });
}

// Get all users, but show friend request status for the logged-in user
function getAllUsersWithFriendStatus(req, res) {
    const myUserId = req.params.userId;
    usersModel.getAllUsersWithFriendStatus(myUserId, (err, users) => {
        if (err) res.status(500).json({ error: err });
        else res.json(users);
    });
}

// Login route (check password, generate JWT, set cookie)
function login(req, res) {
    const { email, password } = req.body;
    usersModel.getUserByEmail(email, async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const match = await checkPassword(password, user.password_hash);
        if (match) {
            const accessToken = generateJWT({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });
            res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax' });
            console.log("USER OBJECT RETURNED ON LOGIN:", user);
            res.json({
                message: 'Login successful!',
                username: user.username,
                profilePicture: user.profile_picture,
                bio: user.bio,
                id: user.id,
                role: user.role
            });

        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    });
}
// Get friend suggestions
function getFriendSuggestions(req, res) {

    const userId = req.params.userId;

    usersModel.getFriendSuggestions(userId, (err, users) => {

        if (err) {

            console.log(
                'GET FRIEND SUGGESTIONS ERROR:',
                err
            );

            res.status(500).json({
                error: err
            });

        } else {

            res.json(users);

        }

    });

}
// Ban user
function banUser(req, res) {

    const userId = req.params.id;

    usersModel.updateAccountStatus(
        userId,
        'banned',
        (err, result) => {

            if (err) {

                console.log(
                    'BAN USER ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'User banned!'
                });

            }

        }
    );

}

// Mute user
function muteUser(req, res) {

    const userId = req.params.id;

    usersModel.updateAccountStatus(
        userId,
        'muted',
        (err, result) => {

            if (err) {

                console.log(
                    'MUTE USER ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'User muted!'
                });

            }

        }
    );

}

// Unmute user
function unmuteUser(req, res) {

    const userId = req.params.id;

    usersModel.updateAccountStatus(
        userId,
        'active',
        (err, result) => {

            if (err) {

                console.log(
                    'UNMUTE USER ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'User unmuted!'
                });

            }

        }
    );

}

// Promote to moderator
function promoteModerator(req, res) {

    const userId = req.params.id;

    usersModel.updateUserRole(
        userId,
        'moderator',
        (err, result) => {

            if (err) {

                console.log(
                    'PROMOTE MODERATOR ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'User promoted to moderator!'
                });

            }

        }
    );

}

// Remove moderator
function removeModerator(req, res) {

    const userId = req.params.id;

    usersModel.updateUserRole(
        userId,
        'user',
        (err, result) => {

            if (err) {

                console.log(
                    'REMOVE MODERATOR ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Moderator removed!'
                });

            }

        }
    );

}

module.exports = {
    banUser,
    muteUser,
    unmuteUser,
    promoteModerator,
    removeModerator,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    register,
    login,
    getAllUsersWithFriendStatus,
    getFriendSuggestions
};