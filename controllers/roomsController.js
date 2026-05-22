const roomsModel = require('../models/roomsModel');
const notificationsModel = require('../models/notificationsModel');

// Get all rooms
function getAllRooms(req, res) {

    roomsModel.getAllRooms((err, rooms) => {

        if (err) {

            console.log('GET ALL ROOMS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(rooms);

        }

    });

}

// Get one room by ID
function getRoomById(req, res) {

    const id = req.params.id;

    roomsModel.getRoomById(id, (err, room) => {

        if (err) {

            console.log('GET ROOM BY ID ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(room);

        }

    });

}

// Create room
function createRoom(req, res) {

    const {
        room_name,
        slug,
        description,
        room_type,
        visibility,
        verified,
        owner_id
    } = req.body;

    const logo = req.files?.logo?.[0]?.filename || null;
    const banner = req.files?.banner?.[0]?.filename || null;

    roomsModel.createRoom(
        {
            room_name,
            slug,
            description,
            room_type,
            visibility,
            logo,
            banner,
            verified,
            owner_id
        },
        (err, result) => {

            if (err) {

                console.log('ROOM CREATE ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Room created!',
                    roomId: result.insertId,
                    logo: logo ? `/uploads/${logo}` : null,
                    banner: banner ? `/uploads/${banner}` : null
                });

            }

        }
    );

}

// Search rooms
function searchRooms(req, res) {

    const searchTerm = req.query.search || '';

    roomsModel.searchRooms(searchTerm, (err, rooms) => {

        if (err) {

            console.log('SEARCH ROOMS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(rooms);

        }

    });

}

// Join room
function joinRoom(req, res) {

    const roomId = req.params.roomId;
    const { userId } = req.body;

    roomsModel.joinRoom(roomId, userId, (err, result) => {

        if (err) {

            console.log('JOIN ROOM ERROR:', err);

            return res.status(500).json(err);

        }

        // PRIVATE ROOM JOIN REQUEST NOTIFICATION
        if (result.type === 'request_sent') {

            roomsModel.getRoomById(roomId, (roomErr, room) => {

                if (roomErr || !room) {

                    console.log(
                        'ROOM FETCH ERROR:',
                        roomErr
                    );

                } else {

                    // Prevent self notification
                    if (room.owner_id != userId) {

                        notificationsModel.createNotification(
                            {
                                user_id: room.owner_id,
                                sender_id: userId,
                                type: 'room_join_request',
                                message: 'Someone requested to join your room',
                                reference_id: roomId
                            },
                            (notificationErr) => {

                                if (notificationErr) {

                                    console.log(
                                        'ROOM REQUEST NOTIFICATION ERROR:',
                                        notificationErr
                                    );

                                } else {

                                    console.log(
                                        'ROOM REQUEST NOTIFICATION CREATED'
                                    );

                                }

                            }
                        );

                    }

                }

            });

        }

        res.json(result);

    });

}

// Leave room
function leaveRoom(req, res) {

    const roomId = req.params.roomId;
    const { userId } = req.body;

    roomsModel.leaveRoom(roomId, userId, (err, result) => {

        if (err) {

            console.log('LEAVE ROOM ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Left room successfully'
            });

        }

    });

}

// Get room members
function getRoomMembers(req, res) {

    const roomId = req.params.roomId;

    roomsModel.getRoomMembers(roomId, (err, members) => {

        if (err) {

            console.log('GET ROOM MEMBERS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(members);

        }

    });

}

// Get pending join requests
function getRoomJoinRequests(req, res) {

    const roomId = req.params.roomId;

    roomsModel.getRoomJoinRequests(roomId, (err, requests) => {

        if (err) {

            console.log('GET ROOM REQUESTS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(requests);

        }

    });

}

// Approve join request
function approveJoinRequest(req, res) {

    const requestId = req.params.requestId;

    roomsModel.approveJoinRequest(requestId, (err, result) => {

        if (err) {

            console.log('APPROVE REQUEST ERROR:', err);

            return res.status(500).json({
                error: err
            });

        }

        // APPROVAL NOTIFICATION
        notificationsModel.createNotification(
            {
                user_id: result.user_id,
                sender_id: null,
                type: 'room_request_approved',
                message: 'Your room join request was approved',
                reference_id: result.room_id
            },
            (notificationErr) => {

                if (notificationErr) {

                    console.log(
                        'APPROVAL NOTIFICATION ERROR:',
                        notificationErr
                    );

                } else {

                    console.log(
                        'APPROVAL NOTIFICATION CREATED'
                    );

                }

            }
        );

        res.json({
            message: 'Join request approved!'
        });

    });

}

// Reject join request
function rejectJoinRequest(req, res) {

    const requestId = req.params.requestId;

    roomsModel.rejectJoinRequest(requestId, (err, result) => {

        if (err) {

            console.log('REJECT REQUEST ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Join request rejected!'
            });

        }

    });

}
// Get recommended rooms
function getRecommendedRooms(req, res) {

    const userId = req.params.userId;

    roomsModel.getRecommendedRooms(userId, (err, rooms) => {

        if (err) {

            console.log(
                'GET RECOMMENDED ROOMS ERROR:',
                err
            );

            res.status(500).json({
                error: err
            });

        } else {

            res.json(rooms);

        }

    });

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