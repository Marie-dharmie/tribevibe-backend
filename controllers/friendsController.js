const friendsModel = require('../models/friendsModel');
const notificationsModel = require('../models/notificationsModel');

// Get a list of accepted friends for a user
function getFriends(req, res) {

    const userId = req.params.userId;

    friendsModel.getFriends(userId, (err, friends) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json(friends);

        }

    });

}

// Get all friend requests sent TO this user
function getFriendRequests(req, res) {

    const userId = req.params.userId;

    friendsModel.getFriendRequests(userId, (err, requests) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json(requests);

        }

    });

}

// Get all friend requests SENT by this user
function getSentFriendRequests(req, res) {

    const userId = req.params.userId;

    friendsModel.getSentFriendRequests(userId, (err, requests) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json(requests);

        }

    });

}

// Create/send a friend request
function createFriendRequest(req, res) {

    friendsModel.createFriendRequest(req.body, (err, result) => {

        if (err) {

            return res.status(400).json({
                error: err.error || 'Failed to send request'
            });

        }

        // AUTO CREATE NOTIFICATION
        notificationsModel.createNotification(
            {
                user_id: req.body.friend_id,
                sender_id: req.body.user_id,
                type: 'friend_request',
                message: 'You received a friend request',
                reference_id: result.insertId
            },
            (notificationErr) => {

                if (notificationErr) {

                    console.log(
                        'NOTIFICATION ERROR:',
                        notificationErr
                    );

                }

            }
        );

        res.json({
            message: 'Friend request sent!',
            requestId: result.insertId
        });

    });

}

// Accept/decline/block request
function updateFriendStatus(req, res) {

    const id = req.params.id;
    const { status } = req.body;

    friendsModel.updateFriendStatus(id, status, (err, result) => {

        if (err) {

            return res.status(500).json({
                error: err
            });

        }

        // CREATE ACCEPTED NOTIFICATION
        if (status === 'accepted') {

            friendsModel.getFriendRequestById(id, (requestErr, request) => {

                if (requestErr || !request) {

                    console.log(
                        'GET FRIEND REQUEST ERROR:',
                        requestErr
                    );

                } else {

                    notificationsModel.createNotification(
                        {
                            user_id: request.user_id,
                            sender_id: request.friend_id,
                            type: 'friend_accept',
                            message: 'Your friend request was accepted',
                            reference_id: id
                        },
                        (notificationErr) => {

                            if (notificationErr) {

                                console.log(
                                    'ACCEPT NOTIFICATION ERROR:',
                                    notificationErr
                                );

                            }

                        }
                    );

                }

            });

        }

        res.json({
            message: 'Friend status updated!'
        });

    });

}

// Delete friendship/request
function deleteFriend(req, res) {

    const id = req.params.id;

    friendsModel.deleteFriend(id, (err, result) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Friend deleted!'
            });

        }

    });

}
// Get mutual friends count
function getMutualFriends(req, res) {

    const userId = req.params.userId;
    const targetUserId = req.params.targetUserId;

    friendsModel.getMutualFriends(
        userId,
        targetUserId,
        (err, result) => {

            if (err) {

                console.log(
                    'GET MUTUAL FRIENDS ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json(result);

            }

        }
    );

}

module.exports = {
    getFriends,
    getFriendRequests,
    getSentFriendRequests,
    getMutualFriends,
    createFriendRequest,
    updateFriendStatus,
    deleteFriend
};