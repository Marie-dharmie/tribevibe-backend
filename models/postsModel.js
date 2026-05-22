const db = require('../services/database').config;

// Create a new post with multiple images + videos
function createPost(postData, callback) {

    const {
        user_id,
        content,
        event_id,
        room_id,
        images,
        videos
    } = postData;

    // First create post
    db.query(
        `
        INSERT INTO posts (
            user_id,
            content,
            event_id,
            room_id
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            user_id,
            content,
            event_id || null,
            room_id || null
        ],
        (err, result) => {

            if (err) {

                return callback(err);

            }

            const postId = result.insertId;

            // SAVE IMAGES
            if (images && images.length > 0) {

                const imageValues = images.map(
                    image => [
                        postId,
                        image
                    ]
                );

                db.query(
                    `
                    INSERT INTO post_images (
                        post_id,
                        image
                    )
                    VALUES ?
                    `,
                    [imageValues],
                    (imageErr) => {

                        if (imageErr) {

                            console.log(
                                'IMAGE INSERT ERROR:',
                                imageErr
                            );

                        }

                    }
                );

            }

            // SAVE VIDEOS
            if (videos && videos.length > 0) {

                const videoValues = videos.map(
                    video => [
                        postId,
                        video
                    ]
                );

                db.query(
                    `
                    INSERT INTO post_videos (
                        post_id,
                        video
                    )
                    VALUES ?
                    `,
                    [videoValues],
                    (videoErr) => {

                        if (videoErr) {

                            console.log(
                                'VIDEO INSERT ERROR:',
                                videoErr
                            );

                        }

                    }
                );

            }

            callback(null, {
                postId
            });

        }
    );

}

// Update an existing post’s content or event link
function updatePost(id, postData, callback) {

    const {
        content,
        event_id,
        room_id
    } = postData;

    db.query(
        `
        UPDATE posts
        SET
            content = ?,
            event_id = ?,
            room_id = ?
        WHERE id = ?
        `,
        [
            content,
            event_id || null,
            room_id || null,
            id
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete a post by ID
function deletePost(id, callback) {

    db.query(
        'DELETE FROM posts WHERE id = ?',
        [id],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Get all posts (global feed with ranking + images + videos)
function getAllPosts(callback) {

    db.query(
        `
        SELECT 
            posts.*,

            ccl_users.username,
            ccl_users.profile_picture,

            rooms.room_name,

            COUNT(DISTINCT post_likes.id) AS like_count,
            COUNT(DISTINCT comments.id) AS comment_count,

            GROUP_CONCAT(
                DISTINCT post_images.image
            ) AS images,

            GROUP_CONCAT(
                DISTINCT post_videos.video
            ) AS videos,

            (
                COUNT(DISTINCT post_likes.id) * 2
                +
                COUNT(DISTINCT comments.id) * 3
            ) AS engagement_score

        FROM posts

        LEFT JOIN ccl_users
            ON posts.user_id = ccl_users.id

        LEFT JOIN rooms
            ON posts.room_id = rooms.id

        LEFT JOIN post_likes
            ON posts.id = post_likes.post_id

        LEFT JOIN comments
            ON posts.id = comments.post_id

        LEFT JOIN post_images
            ON posts.id = post_images.post_id

        LEFT JOIN post_videos
            ON posts.id = post_videos.post_id

        GROUP BY posts.id

        ORDER BY
            engagement_score DESC,
            posts.created_at DESC
        `,
        (err, results) => {

            if (err) {

                return callback(err);

            }

            const formattedResults = results.map(post => ({

                ...post,

                images: post.images
                    ? post.images.split(',')
                    : [],

                videos: post.videos
                    ? post.videos.split(',')
                    : []

            }));

            callback(null, formattedResults);

        }
    );

}

// Get all posts for a specific room
function getPostsByRoom(roomId, callback) {

    db.query(
        `
        SELECT 
            posts.*,

            ccl_users.username,
            ccl_users.profile_picture,

            rooms.room_name,

            GROUP_CONCAT(
                DISTINCT post_images.image
            ) AS images,

            GROUP_CONCAT(
                DISTINCT post_videos.video
            ) AS videos

        FROM posts

        LEFT JOIN ccl_users
            ON posts.user_id = ccl_users.id

        LEFT JOIN rooms
            ON posts.room_id = rooms.id

        LEFT JOIN post_images
            ON posts.id = post_images.post_id

        LEFT JOIN post_videos
            ON posts.id = post_videos.post_id

        WHERE posts.room_id = ?

        GROUP BY posts.id

        ORDER BY posts.created_at DESC
        `,
        [roomId],
        (err, results) => {

            if (err) {

                return callback(err);

            }

            const formattedResults = results.map(post => ({

                ...post,

                images: post.images
                    ? post.images.split(',')
                    : [],

                videos: post.videos
                    ? post.videos.split(',')
                    : []

            }));

            callback(null, formattedResults);

        }
    );

}

// Search posts
function searchPosts(query, callback) {

    db.query(
        `
        SELECT 
            posts.*,

            ccl_users.username,

            events.title AS event_title,

            rooms.room_name,

            GROUP_CONCAT(
                DISTINCT post_images.image
            ) AS images,

            GROUP_CONCAT(
                DISTINCT post_videos.video
            ) AS videos

        FROM posts

        LEFT JOIN ccl_users
            ON posts.user_id = ccl_users.id

        LEFT JOIN events
            ON posts.event_id = events.id

        LEFT JOIN rooms
            ON posts.room_id = rooms.id

        LEFT JOIN post_images
            ON posts.id = post_images.post_id

        LEFT JOIN post_videos
            ON posts.id = post_videos.post_id

        WHERE
            posts.content LIKE ? OR
            ccl_users.username LIKE ? OR
            events.title LIKE ? OR
            rooms.room_name LIKE ?

        GROUP BY posts.id

        ORDER BY posts.created_at DESC
        `,
        [
            `%${query}%`,
            `%${query}%`,
            `%${query}%`,
            `%${query}%`
        ],
        (err, results) => {

            if (err) {

                return callback(err);

            }

            const formattedResults = results.map(post => ({

                ...post,

                images: post.images
                    ? post.images.split(',')
                    : [],

                videos: post.videos
                    ? post.videos.split(',')
                    : []

            }));

            callback(null, formattedResults);

        }
    );

}

// Get single post by ID
function getPostById(postId, callback) {

    db.query(
        `
        SELECT 
            posts.*,

            GROUP_CONCAT(
                DISTINCT post_images.image
            ) AS images,

            GROUP_CONCAT(
                DISTINCT post_videos.video
            ) AS videos

        FROM posts

        LEFT JOIN post_images
            ON posts.id = post_images.post_id

        LEFT JOIN post_videos
            ON posts.id = post_videos.post_id

        WHERE posts.id = ?

        GROUP BY posts.id
        `,
        [postId],
        (err, results) => {

            if (err) {

                callback(err);

            } else {

                const post = results[0];

                if (post) {

                    post.images = post.images
                        ? post.images.split(',')
                        : [];

                    post.videos = post.videos
                        ? post.videos.split(',')
                        : [];

                }

                callback(null, post);

            }

        }
    );

}

module.exports = {
    getAllPosts,
    getPostsByRoom,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    searchPosts
};