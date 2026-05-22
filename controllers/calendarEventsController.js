// Import the model that handles database logic for calendar events
const calendarEventsModel = require('../models/calendarEventsModel');


// Get calendar events for a specific  user
function getUserCalendarEvents(req, res) {
    const userId = req.params.userId;
    // Calls the model function and returns the events as JSON
    calendarEventsModel.getUserCalendarEvents(userId, (err, events) => {
        if (err) res.status(500).json({ error: err });
        else res.json(events);
    });
}

// Add a new event to the user's calendar (when user RSVPs)
function createCalendarEvent(req, res) {
    calendarEventsModel.createCalendarEvent(req.body, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "Calendar event created!", calendarEventId: result.insertId });
    });
}

// Update an existing  calendar event
function updateCalendarEvent(req, res) {
    const id = req.params.id;
    calendarEventsModel.updateCalendarEvent(id, req.body, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "Calendar event updated!" });
    });
}
// Get the number of people who RSVPed for a particular event
function getEventAttendeeCount(req, res) {
    const eventId = req.params.eventId;
    calendarEventsModel.getEventAttendeeCount(eventId, (err, count) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ count }); // returns { count: 12 }
    });
}

// Remove an event from the user's calendar (cancel RSVP)
function removeCalendarEvent(req, res) {
    const { user_id, event_id } = req.body;
    calendarEventsModel.removeCalendarEvent(user_id, event_id, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "RSVP removed!" });
    });
}

// Permanently deletes a calendar event from the database
function deleteCalendarEvent(req, res) {
    const id = req.params.id;
    calendarEventsModel.deleteCalendarEvent(id, (err, result) => {
        if (err) res.status(500).json({ error: err });
        else res.json({ message: "Calendar event deleted!" });
    });
}


// Export all controller functions for use in the routes
module.exports = {
    getUserCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getEventAttendeeCount,
    removeCalendarEvent
};
