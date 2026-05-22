const db = require('../services/database').config;
const { hashPassword } = require('../services/authentication');

// Get all users
function getAllUsers(callback) {

    db.query(
        'SELECT * FROM ccl_users',
        (err, results) => {

            callback(err, results);

        }
    );

}

// Get single user
function getUserById(id, callback) {

    db.query(
        'SELECT * FROM ccl_users WHERE id = ?',
        [id],
        (err, results) => {

            callback(err, results[0]);

        }
    );

}

// Create user
function createUser(userData, callback) {

    const {
        username,
        email,
        password,
        bio,
        profile_picture
    } = userData;

    hashPassword(password)
        .then(password_hash => {

            db.query(
                `
                INSERT INTO ccl_users (
                    username,
                    email,
                    password_hash,
                    bio,
                    profile_picture
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    username,
                    email,
                    password_hash,
                    bio || null,
                    profile_picture || null
                ],
                (err, result) => {

                    if (err) {

                        console.log(
                            'DB Insert Error:',
                            err
                        );

                    }

                    callback(err, result);

                }
            );

        })
        .catch(err => {

            console.log(
                'Hash Error:',
                err
            );

            callback(err);

        });

}

// Update user
function updateUser(id, userData, callback) {

    const {
        username,
        email,
        bio
    } = userData;

    db.query(
        `
        UPDATE ccl_users
        SET
            username = ?,
            email = ?,
            bio = ?
        WHERE id = ?
        `,
        [
            username,
            email,
            bio || null,
            id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete user
function deleteUser(id, callback) {

    db.query(
        `
        DELETE FROM ccl_users
        WHERE id = ?
        `,
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Get user by email
function getUserByEmail(email, callback) {

    db.query(
        'SELECT * FROM ccl_users WHERE email = ?',
        [email],
        (err, results) => {

            callback(err, results[0]);

        }
    );

}

// Get all users with friendship status
function getAllUsersWithFriendStatus(myUserId, callback) {

    const sql = `
        SELECT 
            u.id,
            u.username,
            u.bio,
            u.profile_picture,

            CASE 
                WHEN f.status = 'accepted'
                    THEN 'accepted'

                WHEN f.status = 'pending'
                    AND f.user_id = ?
                    THEN 'pending_sent'

                WHEN f.status = 'pending'
                    AND f.friend_id = ?
                    THEN 'pending_received'

                ELSE 'none'
            END AS friend_status

        FROM ccl_users u

        LEFT JOIN friends f
            ON (
                (f.user_id = ? AND f.friend_id = u.id)
                OR
                (f.user_id = u.id AND f.friend_id = ?)
            )

        AND (
            f.status = 'accepted'
            OR f.status = 'pending'
        )

        WHERE u.id != ?
    `;

    db.query(
        sql,
        [
            myUserId,
            myUserId,
            myUserId,
            myUserId,
            myUserId
        ],
        (err, results) => {

            callback(err, results);

        }
    );

}

// NEW: Friend suggestions
function getFriendSuggestions(userId, callback) {

    const sql = `
        SELECT
            u.id,
            u.username,
            u.bio,
            u.profile_picture

        FROM ccl_users u

        WHERE u.id != ?

        AND u.id NOT IN (

            SELECT
                CASE
                    WHEN f.user_id = ?
                        THEN f.friend_id
                    ELSE f.user_id
                END

            FROM friends f

            WHERE
                (
                    f.user_id = ?
                    OR f.friend_id = ?
                )

                AND (
                    f.status = 'accepted'
                    OR f.status = 'pending'
                )

        )

        ORDER BY u.created_at DESC
        LIMIT 20
    `;

    db.query(
        sql,
        [
            userId,
            userId,
            userId,
            userId
        ],
        (err, results) => {

            callback(err, results);

        }
    );

}
// Update account status
function updateAccountStatus(
    userId,
    status,
    callback
) {

    db.query(
        `
        UPDATE ccl_users
        SET account_status = ?
        WHERE id = ?
        `,
        [
            status,
            userId
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Update user role
function updateUserRole(
    userId,
    role,
    callback
) {

    db.query(
        `
        UPDATE ccl_users
        SET role = ?
        WHERE id = ?
        `,
        [
            role,
            userId
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

module.exports = {
    updateAccountStatus,
    updateUserRole,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserByEmail,
    getAllUsersWithFriendStatus,
    getFriendSuggestions
};