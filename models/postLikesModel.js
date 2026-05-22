const db = require('../services/database').config;

// Add a like to a post for a specific user
// Uses INSERT IGNORE to prevent duplicate likes by the same user on the same post
function likePost(post_id, user_id, callback) {
    db.query(
        'INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [post_id, user_id],
        (err, result) => callback(err, result)
    );
}

// Remove a like (user unlikes a post)
function unlikePost(post_id, user_id, callback) {
    db.query(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [post_id, user_id],
        (err, result) => callback(err, result)
    );
}

// Get the total number of likes for a post
function getLikeCount(post_id, callback) {
    db.query(
        'SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?',
        [post_id],
        (err, results) => callback(err, results[0].count)
    );
}

// Check if a specific user has liked a given post
function hasUserLiked(post_id, user_id, callback) {
    db.query(
        'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
        [post_id, user_id],
        (err, results) => callback(err, results.length > 0)
    );
}

// Get the list of users who liked a specific post (returns username, profile pic, and user_id)
function getLikers(post_id, callback) {
    db.query(
        `SELECT ccl_users.username, ccl_users.profile_picture, post_likes.user_id
         FROM post_likes
         LEFT JOIN ccl_users ON post_likes.user_id = ccl_users.id
         WHERE post_likes.post_id = ?`,
        [post_id],
        (err, results) => callback(err, results)
    );
}

module.exports = {
    likePost,
    unlikePost,
    getLikeCount,
    hasUserLiked,
    getLikers
};
