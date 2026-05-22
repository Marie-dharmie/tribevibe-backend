const commentsModel = require('../models/commentsModel');
const postsModel = require('../models/postsModel');
const notificationsModel = require('../models/notificationsModel');

// Get comments for a post
function getCommentsByPost(req, res) {

    const postId = req.params.postId;

    commentsModel.getCommentsByPost(postId, (err, comments) => {

        if (err) {

            console.log('GET COMMENTS ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(comments);

        }

    });

}

// Create a new comment
function createComment(req, res) {

    const {
        post_id,
        user_id,
        content
    } = req.body;

    commentsModel.createComment(
        {
            post_id,
            user_id,
            content
        },
        (err, result) => {

            if (err) {

                console.log('CREATE COMMENT ERROR:', err);

                return res.status(500).json({
                    error: err
                });

            }

            // Get post owner
            postsModel.getPostById(post_id, (postErr, post) => {

                console.log('POST RESULT:', post);

                if (postErr || !post) {

                    console.log(
                        'GET POST ERROR:',
                        postErr
                    );

                } else {

                    console.log('POST OWNER ID:', post.user_id);
                    console.log('COMMENT USER ID:', user_id);

                    // Prevent notifying yourself
                    if (post.user_id != user_id) {

                        console.log('CREATING COMMENT NOTIFICATION');

                        notificationsModel.createNotification(
                            {
                                user_id: post.user_id,
                                sender_id: user_id,
                                type: 'post_comment',
                                message: 'Someone commented on your post',
                                reference_id: post_id
                            },
                            (notificationErr, notificationResult) => {

                                if (notificationErr) {

                                    console.log(
                                        'COMMENT NOTIFICATION ERROR:',
                                        notificationErr
                                    );

                                } else {

                                    console.log(
                                        'COMMENT NOTIFICATION CREATED:',
                                        notificationResult
                                    );

                                }

                            }
                        );

                    } else {

                        console.log(
                            'SELF COMMENT DETECTED - NO NOTIFICATION'
                        );

                    }

                }

            });
            res.json({
                message: 'Comment created!',
                commentId: result.insertId
            });

        }
    );

}

// Update comment
function updateComment(req, res) {

    const id = req.params.id;

    commentsModel.updateComment(
        id,
        req.body,
        (err, result) => {

            if (err) {

                console.log('UPDATE COMMENT ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Comment updated!'
                });

            }

        }
    );

}

// Delete comment
function deleteComment(req, res) {

    const id = req.params.id;

    commentsModel.deleteComment(id, (err, result) => {

        if (err) {

            console.log('DELETE COMMENT ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Comment deleted!'
            });

        }

    });

}

module.exports = {
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment
};