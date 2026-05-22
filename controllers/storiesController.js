const storiesModel = require('../models/storiesModel');

// Create story
function createStory(req, res) {

    const { user_id } = req.body;

    if (!req.file) {

        return res.status(400).json({
            error: 'No media uploaded'
        });

    }

    const media = req.file.filename;

    const media_type = req.file.mimetype.startsWith('video/')
        ? 'video'
        : 'image';

    storiesModel.createStory(
        {
            user_id,
            media,
            media_type
        },
        (err, result) => {

            if (err) {

                console.log(
                    'CREATE STORY ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Story created!',
                    storyId: result.insertId,
                    media: `/uploads/${media}`,
                    media_type
                });

            }

        }
    );

}

// Get active stories
function getActiveStories(req, res) {

    storiesModel.getActiveStories(
        (err, stories) => {

            if (err) {

                console.log(
                    'GET STORIES ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json(stories);

            }

        }
    );

}

// Mark story as viewed
function viewStory(req, res) {

    const storyId = req.params.storyId;
    const { viewer_id } = req.body;

    storiesModel.viewStory(
        storyId,
        viewer_id,
        (err, result) => {

            if (err) {

                console.log(
                    'VIEW STORY ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Story viewed!'
                });

            }

        }
    );

}

// Get story viewers
function getStoryViews(req, res) {

    const storyId = req.params.storyId;

    storiesModel.getStoryViews(
        storyId,
        (err, viewers) => {

            if (err) {

                console.log(
                    'GET STORY VIEWS ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json(viewers);

            }

        }
    );

}

// Delete story
function deleteStory(req, res) {

    const id = req.params.id;

    storiesModel.deleteStory(
        id,
        (err, result) => {

            if (err) {

                console.log(
                    'DELETE STORY ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Story deleted!'
                });

            }

        }
    );

}

module.exports = {
    createStory,
    getActiveStories,
    viewStory,
    getStoryViews,
    deleteStory
};