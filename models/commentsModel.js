const db = require('../services/database')
// Get all comments for a specific post
function getCommentsByPost(postId, callback) {

    db.query(
        `
        SELECT
            comments.*,

            ccl_users.username,
            ccl_users.profile_picture

        FROM comments

        LEFT JOIN ccl_users
            ON comments.user_id = ccl_users.id

        WHERE comments.post_id = ?

        ORDER BY comments.created_at ASC
        `,
        [postId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Create a new comment
function createComment(commentData, callback) {

    const {
        post_id,
        user_id,
        content
    } = commentData;

    db.query(
        `
        INSERT INTO comments (
            post_id,
            user_id,
            content
        )
        VALUES (?, ?, ?)
        `,
        [
            post_id,
            user_id,
            content
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Update comment
function updateComment(id, commentData, callback) {

    const { content } = commentData;

    db.query(
        `
        UPDATE comments
        SET content = ?
        WHERE id = ?
        `,
        [
            content,
            id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete comment
function deleteComment(id, callback) {

    db.query(
        `
        DELETE FROM comments
        WHERE id = ?
        `,
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}

module.exports = {
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment
};