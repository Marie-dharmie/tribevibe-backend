const notificationsModel = require('../models/notificationsModel');

// Get notifications for a user
function getNotifications(req, res) {

    const userId = req.params.userId;

    notificationsModel.getNotifications(userId, (err, notifications) => {

        if (err) {

            console.log('GET NOTIFICATIONS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(notifications);

        }

    });

}

// Create notification
function createNotification(req, res) {

    notificationsModel.createNotification(req.body, (err, result) => {

        if (err) {

            console.log('CREATE NOTIFICATION ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Notification created!',
                notificationId: result.insertId
            });

        }

    });

}

// Mark notification as read
function markNotificationAsRead(req, res) {

    const id = req.params.id;

    notificationsModel.markNotificationAsRead(id, (err, result) => {

        if (err) {

            console.log('MARK NOTIFICATION ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Notification marked as read!'
            });

        }

    });

}

// Delete notification
function deleteNotification(req, res) {

    const id = req.params.id;

    notificationsModel.deleteNotification(id, (err, result) => {

        if (err) {

            console.log('DELETE NOTIFICATION ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Notification deleted!'
            });

        }

    });

}

module.exports = {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    deleteNotification
};