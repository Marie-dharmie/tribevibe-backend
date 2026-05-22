const postsModel = require('../models/postsModel');

// Get all posts OR search posts
function getAllPosts(req, res) {

    const search = req.query.search;

    if (search) {

        // Search posts
        postsModel.searchPosts(search, (err, posts) => {

            if (err) {

                console.log('SEARCH POSTS ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json(posts);

            }

        });

    } else {

        // Get all posts
        postsModel.getAllPosts((err, posts) => {

            if (err) {

                console.log('GET ALL POSTS ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json(posts);

            }

        });

    }

}

// Get posts for a specific room
function getPostsByRoom(req, res) {

    const roomId = req.params.roomId;

    postsModel.getPostsByRoom(roomId, (err, posts) => {

        if (err) {

            console.log('GET POSTS BY ROOM ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json(posts);

        }

    });

}

// Get single post by ID
function getPostById(req, res) {

    const postId = req.params.postId;

    postsModel.getPostById(postId, (err, post) => {

        if (err) {

            console.log(
                'GET POST BY ID ERROR:',
                err
            );

            res.status(500).json({
                error: err
            });

        } else {

            res.json(post);

        }

    });

}

// Create a new post (supports multiple images + room posts)
function createPost(req, res) {

    const {
        user_id,
        content,
        event_id,
        room_id
    } = req.body;

    // MULTIPLE IMAGES
    const images = req.files?.images
        ? req.files.images.map(
            file => file.filename
        )
        : [];

    // MULTIPLE VIDEOS
    const videos = req.files?.videos
        ? req.files.videos.map(
            file => file.filename
        )
        : [];

    postsModel.createPost(
        {
            user_id,
            content,
            event_id,
            room_id,
            images,
            videos
        },
        (err, result) => {

            if (err) {

                console.log(
                    'CREATE POST ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Post created!',
                    postId: result.postId,
                    room_id: room_id || null,

                    images: images.map(
                        image => `/uploads/${image}`
                    ),

                    videos: videos.map(
                        video => `/uploads/${video}`
                    )
                });

            }

        }
    );

}
// Edit/update an existing post
function updatePost(req, res) {

    const id = req.params.id;

    postsModel.updatePost(
        id,
        req.body,
        (err, result) => {

            if (err) {

                console.log('UPDATE POST ERROR:', err);

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Post updated!'
                });

            }

        }
    );

}

// Remove a post
function deletePost(req, res) {

    const id = req.params.id;

    postsModel.deletePost(id, (err, result) => {

        if (err) {

            console.log('DELETE POST ERROR:', err);

            res.status(500).json({
                error: err
            });

        } else {

            res.json({
                message: 'Post deleted!'
            });

        }

    });

}

module.exports = {
    getAllPosts,
    getPostsByRoom,
    getPostById,
    createPost,
    updatePost,
    deletePost
};