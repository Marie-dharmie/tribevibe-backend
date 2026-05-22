const postLikesModel = require('../models/postLikesModel');
const postsModel = require('../models/postsModel');
const notificationsModel = require('../models/notificationsModel');

// Mark a post as liked by a user
function likePost(req, res) {

    const postId = req.params.postId;
    const userId = req.body.user_id;

    postLikesModel.likePost(postId, userId, (err, result) => {

        if (err) {

            return res.status(500).json({
                error: err
            });

        }

        // Get post owner
        postsModel.getPostById(postId, (postErr, post) => {

            if (postErr || !post) {

                console.log(
                    'GET POST ERROR:',
                    postErr
                );

            } else {

                // Prevent notifying yourself
                if (post.user_id != userId) {

                    notificationsModel.createNotification(
                        {
                            user_id: post.user_id,
                            sender_id: userId,
                            type: 'post_like',
                            message: 'Someone liked your post',
                            reference_id: postId
                        },
                        (notificationErr) => {

                            if (notificationErr) {

                                console.log(
                                    'LIKE NOTIFICATION ERROR:',
                                    notificationErr
                                );

                            }

                        }
                    );

                }

            }

        });

        res.json({
            message: 'Post liked!'
        });

    });

}

// Remove a like from a post for a user
function unlikePost(req, res) {

    const postId = req.params.postId;
    const userId = req.body.user_id;

    postLikesModel.unlikePost(postId, userId, (err, result) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Post unliked!'
            });

        }

    });

}

// Get the total number of likes for a post
function getLikeCount(req, res) {

    const postId = req.params.postId;

    postLikesModel.getLikeCount(postId, (err, count) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                count
            });

        }

    });

}

// Check if a specific user liked a specific post
function hasUserLiked(req, res) {

    const postId = req.params.postId;
    const userId = req.params.userId;

    postLikesModel.hasUserLiked(postId, userId, (err, liked) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                liked
            });

        }

    });

}

// Get a list of users who liked a specific post
function getLikers(req, res) {

    const postId = req.params.postId;

    postLikesModel.getLikers(postId, (err, likers) => {

        if (err) {

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                likers
            });

        }

    });

}

module.exports = {
    likePost,
    unlikePost,
    getLikeCount,
    hasUserLiked,
    getLikers
};