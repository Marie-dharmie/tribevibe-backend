const db = require('../services/database')

// Get all calendar events for a specific user
function getUserCalendarEvents(userId, callback) {

    db.query(
        `
        SELECT
            calendar_events.id AS calendar_event_id,

            events.id AS event_id,
            events.title,
            events.description,
            events.date,
            events.location,
            events.image,

            rooms.id AS room_id,
            rooms.room_name,

            ccl_users.id AS creator_id,
            ccl_users.username AS creator_username,
            ccl_users.profile_picture AS creator_profile_picture

        FROM calendar_events

        LEFT JOIN events
            ON calendar_events.event_id = events.id

        LEFT JOIN rooms
            ON events.room_id = rooms.id

        LEFT JOIN ccl_users
            ON events.created_by = ccl_users.id

        WHERE calendar_events.user_id = ?

        ORDER BY events.date ASC
        `,
        [userId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Add a new event to a user's calendar (RSVP)
function createCalendarEvent(eventData, callback) {

    const { user_id, event_id } = eventData;

    db.query(
        `
        INSERT IGNORE INTO calendar_events (
            user_id,
            event_id
        )
        VALUES (?, ?)
        `,
        [user_id, event_id],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Update an existing calendar event by its row ID
function updateCalendarEvent(id, eventData, callback) {

    const {
        user_id,
        event_id
    } = eventData;

    db.query(
        `
        UPDATE calendar_events
        SET
            user_id = ?,
            event_id = ?
        WHERE id = ?
        `,
        [
            user_id,
            event_id,
            id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete a calendar event row by its ID
function deleteCalendarEvent(id, callback) {

    db.query(
        'DELETE FROM calendar_events WHERE id = ?',
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Remove a user's RSVP for a specific event
function removeCalendarEvent(user_id, event_id, callback) {

    db.query(
        `
        DELETE FROM calendar_events
        WHERE user_id = ?
        AND event_id = ?
        `,
        [
            user_id,
            event_id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Count how many users have RSVP'd for an event
function getEventAttendeeCount(eventId, callback) {

    db.query(
        `
        SELECT COUNT(*) AS count
        FROM calendar_events
        WHERE event_id = ?
        `,
        [eventId],
        (err, results) => {

            if (err) {

                callback(err);

            } else {

                callback(null, results[0].count);

            }

        }
    );

}

module.exports = {
    getUserCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getEventAttendeeCount,
    removeCalendarEvent
};