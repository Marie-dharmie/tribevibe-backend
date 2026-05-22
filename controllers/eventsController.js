const eventsModel = require('../models/eventsModel');

// Get all events
function getAllEvents(req, res) {

    eventsModel.getAllEvents((err, events) => {

        if (err) {

            console.log('GET ALL EVENTS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(events);

        }

    });

}

// Get events for a specific room
function getEventsByRoom(req, res) {

    const roomId = req.params.roomId;

    eventsModel.getEventsByRoom(roomId, (err, events) => {

        if (err) {

            console.log('GET EVENTS BY ROOM ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(events);

        }

    });

}

// Create a new event
function createEvent(req, res) {

    const {
        title,
        description,
        date,
        location,
        created_by,
        room_id
    } = req.body;

    const image = req.file
        ? req.file.filename
        : null;

    eventsModel.createEvent(
        {
            title,
            description,
            date,
            location,
            created_by,
            room_id,
            image
        },
        (err, result) => {

            if (err) {

                console.log('CREATE EVENT ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Event created!',
                    eventId: result.insertId,
                    room_id: room_id || null,
                    image: image
                        ? `/uploads/${image}`
                        : null
                });

            }

        }
    );

}

// Update an existing event
function updateEvent(req, res) {

    const id = req.params.id;

    eventsModel.updateEvent(
        id,
        req.body,
        (err, result) => {

            if (err) {

                console.log('UPDATE EVENT ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Event updated!'
                });

            }

        }
    );

}

// Delete an event
function deleteEvent(req, res) {

    const id = req.params.id;

    eventsModel.deleteEvent(id, (err, result) => {

        if (err) {

            console.log('DELETE EVENT ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Event deleted!'
            });

        }

    });

}
// Get trending events
function getTrendingEvents(req, res) {

    eventsModel.getTrendingEvents((err, events) => {

        if (err) {

            console.log(
                'GET TRENDING EVENTS ERROR:',
                err
            );

            res.status(500).json({
                error: err
            });

        } else {

            res.json(events);

        }

    });

}

module.exports = {
    getAllEvents,
    getEventsByRoom,
    createEvent,
    updateEvent,
    getTrendingEvents,
    deleteEvent
};