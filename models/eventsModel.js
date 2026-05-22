const db = require('../services/database').config;

// Get all events
function getAllEvents(callback) {

    db.query(
        `
        SELECT 
            events.*,
            rooms.room_name,
            ccl_users.username AS created_by_username,
            ccl_users.profile_picture AS created_by_profilePicture

        FROM events

        LEFT JOIN ccl_users
            ON events.created_by = ccl_users.id

        LEFT JOIN rooms
            ON events.room_id = rooms.id

        ORDER BY events.date DESC
        `,
        (err, results) => {
            callback(err, results);
        }
    );

}

// Get events for a specific room
function getEventsByRoom(roomId, callback) {

    db.query(
        `
        SELECT 
            events.*,
            rooms.room_name,
            ccl_users.username AS created_by_username,
            ccl_users.profile_picture AS created_by_profilePicture

        FROM events

        LEFT JOIN ccl_users
            ON events.created_by = ccl_users.id

        LEFT JOIN rooms
            ON events.room_id = rooms.id

        WHERE events.room_id = ?

        ORDER BY events.date DESC
        `,
        [roomId],
        (err, results) => {
            callback(err, results);
        }
    );

}

// Create a new event
function createEvent(eventData, callback) {

    const {
        title,
        description,
        date,
        location,
        created_by,
        room_id,
        image
    } = eventData;

    db.query(
        `
        INSERT INTO events (
            title,
            description,
            date,
            location,
            created_by,
            room_id,
            image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            title,
            description,
            date,
            location,
            created_by,
            room_id || null,
            image || null
        ],
        (err, result) => {
            callback(err, result);
        }
    );

}

// Update an existing event
function updateEvent(id, eventData, callback) {

    const {
        title,
        description,
        date,
        location,
        created_by,
        room_id
    } = eventData;

    db.query(
        `
        UPDATE events
        SET
            title = ?,
            description = ?,
            date = ?,
            location = ?,
            created_by = ?,
            room_id = ?
        WHERE id = ?
        `,
        [
            title,
            description,
            date,
            location,
            created_by,
            room_id || null,
            id
        ],
        (err, result) => {
            callback(err, result);
        }
    );

}

// Delete an event
function deleteEvent(id, callback) {

    // First remove RSVPs
    db.query(
        'DELETE FROM calendar_events WHERE event_id = ?',
        [id],
        (err, result) => {

            if (err) return callback(err);

            // Then remove event
            db.query(
                'DELETE FROM events WHERE id = ?',
                [id],
                (err2, result2) => {
                    callback(err2, result2);
                }
            );

        }
    );

}
// Get trending upcoming events
function getTrendingEvents(callback) {

    db.query(
        `
        SELECT
            events.*,

            COUNT(calendar_events.id) AS attendee_count

        FROM events

        LEFT JOIN calendar_events
            ON events.id = calendar_events.event_id

        WHERE events.date >= NOW()

        GROUP BY events.id

        ORDER BY
            attendee_count DESC,
            events.date ASC
        `,
        (err, results) => {

            callback(err, results);

        }
    );

}

module.exports = {
    getAllEvents,
    getEventsByRoom,
    createEvent,
    updateEvent,
    getTrendingEvents,
    deleteEvent
};