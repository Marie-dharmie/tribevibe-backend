const db = require('../services/database');

// Get all visible rooms
function getAllRooms(callback) {

    const sql = `
        SELECT 
            rooms.*,
            ccl_users.username AS owner_username,
            ccl_users.profile_picture AS owner_profile_picture
        FROM rooms

        LEFT JOIN ccl_users
            ON rooms.owner_id = ccl_users.id

        WHERE rooms.visibility != 'hidden'

        ORDER BY rooms.created_at DESC
    `;

    db.query(sql, (err, results) => {

        callback(err, results);

    });

}

// Get a single room by ID
function getRoomById(id, callback) {

    const sql = `
        SELECT 
            rooms.*,
            ccl_users.username AS owner_username,
            ccl_users.profile_picture AS owner_profile_picture
        FROM rooms

        LEFT JOIN ccl_users
            ON rooms.owner_id = ccl_users.id

        WHERE rooms.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        callback(err, results[0]);

    });

}

// Create a new room
function createRoom(roomData, callback) {

    const {
        room_name,
        slug,
        description,
        room_type,
        visibility,
        logo,
        banner,
        verified,
        owner_id
    } = roomData;

    const sql = `
        INSERT INTO rooms (
            room_name,
            slug,
            description,
            room_type,
            visibility,
            logo,
            banner,
            verified,
            owner_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            room_name,
            slug,
            description || null,
            room_type,
            visibility || 'public',
            logo || null,
            banner || null,
            verified || false,
            owner_id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Search rooms
function searchRooms(searchTerm, callback) {

    const sql = `
        SELECT *
        FROM rooms
        WHERE visibility != 'hidden'
        AND room_name LIKE ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [`%${searchTerm}%`],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Join a room
function joinRoom(roomId, userId, callback) {

    // First check room visibility
    db.query(
        `
        SELECT visibility
        FROM rooms
        WHERE id = ?
        `,
        [roomId],
        (err, results) => {

            if (err) {

                return callback(err);

            }

            if (results.length === 0) {

                return callback({
                    error: 'Room not found'
                });

            }

            const room = results[0];

            // PUBLIC ROOM = instant join
            if (room.visibility === 'public') {

                db.query(
                    `
                    INSERT IGNORE INTO room_members (
                        room_id,
                        user_id,
                        role
                    )
                    VALUES (?, ?, 'member')
                    `,
                    [roomId, userId],
                    (err2, result2) => {

                        callback(err2, {
                            type: 'joined',
                            result: result2
                        });

                    }
                );

            }

            // PRIVATE ROOM = request approval
            else if (room.visibility === 'private') {

                db.query(
                    `
                    INSERT INTO room_join_requests (
                        room_id,
                        user_id,
                        status
                    )
                    VALUES (?, ?, 'pending')
                    `,
                    [roomId, userId],
                    (err3, result3) => {

                        callback(err3, {
                            type: 'request_sent',
                            result: result3
                        });

                    }
                );

            }

            // HIDDEN ROOM
            else {

                callback({
                    error: 'Hidden rooms require invitation'
                });

            }

        }
    );

}

// Leave room
function leaveRoom(roomId, userId, callback) {

    const sql = `
        DELETE FROM room_members
        WHERE room_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [roomId, userId],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Get all members in a room
function getRoomMembers(roomId, callback) {

    const sql = `
        SELECT
            ccl_users.id,
            ccl_users.username,
            ccl_users.profile_picture,
            room_members.role,
            room_members.joined_at
        FROM room_members

        LEFT JOIN ccl_users
            ON room_members.user_id = ccl_users.id

        WHERE room_members.room_id = ?

        ORDER BY room_members.joined_at DESC
    `;

    db.query(
        sql,
        [roomId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Get pending join requests
function getRoomJoinRequests(roomId, callback) {

    db.query(
        `
        SELECT
            room_join_requests.*,
            ccl_users.username,
            ccl_users.profile_picture

        FROM room_join_requests

        LEFT JOIN ccl_users
            ON room_join_requests.user_id = ccl_users.id

        WHERE room_join_requests.room_id = ?
        AND room_join_requests.status = 'pending'

        ORDER BY room_join_requests.created_at DESC
        `,
        [roomId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Approve join request
function approveJoinRequest(requestId, callback) {

    // First get request info
    db.query(
        `
        SELECT *
        FROM room_join_requests
        WHERE id = ?
        `,
        [requestId],
        (err, results) => {

            if (err) {

                return callback(err);

            }

            if (results.length === 0) {

                return callback({
                    error: 'Request not found'
                });

            }

            const request = results[0];

            // Update request status
            db.query(
                `
                UPDATE room_join_requests
                SET status = 'approved'
                WHERE id = ?
                `,
                [requestId],
                (err2, result2) => {

                    if (err2) {

                        return callback(err2);

                    }

                    // Add member to room
                    db.query(
                        `
                        INSERT IGNORE INTO room_members (
                            room_id,
                            user_id,
                            role
                        )
                        VALUES (?, ?, 'member')
                        `,
                        [
                            request.room_id,
                            request.user_id
                        ],
                        (err3, result3) => {

                            callback(err3, {
                                request: result2,
                                membership: result3,
                                user_id: request.user_id,
                                room_id: request.room_id
                            });

                        }
                    );

                }
            );

        }
    );

}

// Reject join request
function rejectJoinRequest(requestId, callback) {

    db.query(
        `
        UPDATE room_join_requests
        SET status = 'rejected'
        WHERE id = ?
        `,
        [requestId],
        (err, result) => {

            callback(err, result);

        }
    );

}
// Get recommended rooms for a user
function getRecommendedRooms(userId, callback) {

    const sql = `
        SELECT
            rooms.*,

            COUNT(room_members.user_id) AS member_count

        FROM rooms

        LEFT JOIN room_members
            ON rooms.id = room_members.room_id

        WHERE rooms.visibility != 'hidden'

        AND rooms.id NOT IN (

            SELECT room_id
            FROM room_members
            WHERE user_id = ?

        )

        GROUP BY rooms.id

        ORDER BY
            member_count DESC,
            rooms.created_at DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            callback(err, results);

        }
    );

}
module.exports = {
    getAllRooms,
    getRecommendedRooms,
    getRoomById,
    createRoom,
    searchRooms,
    joinRoom,
    leaveRoom,
    getRoomMembers,
    getRoomJoinRequests,
    approveJoinRequest,
    rejectJoinRequest
};