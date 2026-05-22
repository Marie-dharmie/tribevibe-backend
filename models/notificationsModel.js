const db = require('../services/database').config;

// Get notifications for a user
function getNotifications(userId, callback) {

    db.query(
        `
        SELECT
            notifications.*,
            ccl_users.username,
            ccl_users.profile_picture

        FROM notifications

        LEFT JOIN ccl_users
            ON notifications.sender_id = ccl_users.id

        WHERE notifications.user_id = ?

        ORDER BY notifications.created_at DESC
        `,
        [userId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Create notification with deduplication
function createNotification(notificationData, callback) {

    const {
        user_id,
        sender_id,
        type,
        message,
        reference_id
    } = notificationData;

    // Check for existing unread duplicate
    db.query(
        `
        SELECT *
        FROM notifications
        WHERE
            user_id = ?
            AND sender_id <=> ?
            AND type = ?
            AND reference_id <=> ?
            AND is_read = false
        `,
        [
            user_id,
            sender_id || null,
            type,
            reference_id || null
        ],
        (checkErr, checkResults) => {

            if (checkErr) {

                return callback(checkErr);

            }

            // Duplicate exists
            if (checkResults.length > 0) {

                return callback(null, {
                    duplicate: true
                });

            }

            // Create new notification
            db.query(
                `
                INSERT INTO notifications (
                    user_id,
                    sender_id,
                    type,
                    message,
                    reference_id
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    user_id,
                    sender_id || null,
                    type,
                    message,
                    reference_id || null
                ],
                (err, result) => {

                    callback(err, result);

                }
            );

        }
    );

}

// Mark notification as read
function markNotificationAsRead(id, callback) {

    db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE id = ?
        `,
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete notification
function deleteNotification(id, callback) {

    db.query(
        `
        DELETE FROM notifications
        WHERE id = ?
        `,
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}

module.exports = {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    deleteNotification
};