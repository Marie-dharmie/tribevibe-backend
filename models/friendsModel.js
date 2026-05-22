const db = require('../services/database').config;

// Get all accepted friends for a user
function getFriends(userId, callback) {

    const sql = `
        SELECT
            u.id AS friend_id,
            u.username,
            u.profile_picture,
            f.status,
            f.created_at
        FROM friends f

                 JOIN ccl_users u
                      ON u.id = CASE
                                    WHEN f.user_id = ? THEN f.friend_id
                                    ELSE f.user_id
                          END

        WHERE
            (f.user_id = ? OR f.friend_id = ?)
          AND f.status = 'accepted'
    `;

    db.query(
        sql,
        [userId, userId, userId],
        (err, results) => {

            if (err) {
                return callback(err);
            }

            const seenPairs = new Set();
            const filteredResults = [];

            results.forEach(row => {

                const currentUserId = Number(userId);
                const friendId = Number(row.friend_id);

                const pairKey = [
                    Math.min(currentUserId, friendId),
                    Math.max(currentUserId, friendId)
                ].join('-');

                if (!seenPairs.has(pairKey)) {

                    seenPairs.add(pairKey);
                    filteredResults.push(row);

                }

            });

            callback(null, filteredResults);

        }
    );

}

// Get incoming friend requests
function getFriendRequests(userId, callback) {

    db.query(
        `
            SELECT
                friends.*,

                ccl_users.username,
                ccl_users.profile_picture

            FROM friends

                     LEFT JOIN ccl_users
                               ON friends.user_id = ccl_users.id

            WHERE friends.friend_id = ?
              AND friends.status = 'pending'

            ORDER BY friends.created_at DESC
        `,
        [userId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Get outgoing friend requests
function getSentFriendRequests(userId, callback) {

    db.query(
        `
            SELECT
                friends.*,

                ccl_users.username,
                ccl_users.profile_picture

            FROM friends

                     LEFT JOIN ccl_users
                               ON friends.friend_id = ccl_users.id

            WHERE friends.user_id = ?
              AND friends.status = 'pending'

            ORDER BY friends.created_at DESC
        `,
        [userId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// NEW: Get friend request by ID
function getFriendRequestById(id, callback) {

    db.query(
        `
            SELECT *
            FROM friends
            WHERE id = ?
        `,
        [id],
        (err, results) => {

            if (err) {

                callback(err);

            } else {

                callback(null, results[0]);

            }

        }
    );

}

// Create a new friend request safely
function createFriendRequest(friendData, callback) {

    const {
        user_id,
        friend_id
    } = friendData;

    // Prevent adding yourself
    if (user_id == friend_id) {

        return callback({
            error: 'You cannot add yourself'
        });

    }

    // Check if friendship already exists
    db.query(
        `
            SELECT *
            FROM friends
            WHERE
                (user_id = ? AND friend_id = ?)
               OR
                (user_id = ? AND friend_id = ?)
        `,
        [
            user_id,
            friend_id,
            friend_id,
            user_id
        ],
        (err, results) => {

            if (err) return callback(err);

            // Already exists
            if (results.length > 0) {

                return callback({
                    error: 'Friendship or request already exists'
                });

            }

            // Create request
            db.query(
                `
                    INSERT INTO friends (
                        user_id,
                        friend_id,
                        status
                    )
                    VALUES (?, ?, 'pending')
                `,
                [
                    user_id,
                    friend_id
                ],
                (err2, result2) => {

                    callback(err2, result2);

                }
            );

        }
    );

}

// Update friend request status
function updateFriendStatus(id, status, callback) {

    db.query(
        `
            UPDATE friends
            SET status = ?
            WHERE id = ?
        `,
        [
            status,
            id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete friendship or request
function deleteFriend(id, callback) {

    db.query(
        `
            DELETE FROM friends
            WHERE id = ?
        `,
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}
// Get mutual friends count between two users
function getMutualFriends(userId, targetUserId, callback) {

    const sql = `
        SELECT COUNT(*) AS mutual_count

        FROM (

            SELECT
                CASE
                    WHEN user_id = ? THEN friend_id
                    ELSE user_id
                END AS mutual_friend

            FROM friends

            WHERE
                (user_id = ? OR friend_id = ?)
                AND status = 'accepted'

        ) AS user_friends

        INNER JOIN (

            SELECT
                CASE
                    WHEN user_id = ? THEN friend_id
                    ELSE user_id
                END AS mutual_friend

            FROM friends

            WHERE
                (user_id = ? OR friend_id = ?)
                AND status = 'accepted'

        ) AS target_friends

        ON user_friends.mutual_friend =
           target_friends.mutual_friend
    `;

    db.query(
        sql,
        [
            userId,
            userId,
            userId,

            targetUserId,
            targetUserId,
            targetUserId
        ],
        (err, results) => {

            if (err) {

                callback(err);

            } else {

                callback(null, results[0]);

            }

        }
    );

}

module.exports = {
    getFriends,
    getFriendRequests,
    getSentFriendRequests,
    getFriendRequestById,
    getMutualFriends,
    createFriendRequest,
    updateFriendStatus,
    deleteFriend
};