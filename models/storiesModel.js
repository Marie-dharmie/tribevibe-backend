const db = require('../services/database').config;

// Create story
function createStory(storyData, callback) {

    const {
        user_id,
        media,
        media_type
    } = storyData;

    db.query(
        `
        INSERT INTO stories (
            user_id,
            media,
            media_type
        )
        VALUES (?, ?, ?)
        `,
        [
            user_id,
            media,
            media_type
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Get all active stories
function getActiveStories(callback) {

    db.query(
        `
        SELECT
            stories.*,

            ccl_users.username,
            ccl_users.profile_picture

        FROM stories

        LEFT JOIN ccl_users
            ON stories.user_id = ccl_users.id

        WHERE stories.expires_at > NOW()

        ORDER BY stories.created_at DESC
        `,
        (err, results) => {

            callback(err, results);

        }
    );

}

// Mark story as viewed
function viewStory(storyId, viewerId, callback) {

    // Prevent duplicate views
    db.query(
        `
        SELECT *
        FROM story_views
        WHERE story_id = ?
        AND viewer_id = ?
        `,
        [storyId, viewerId],
        (checkErr, checkResults) => {

            if (checkErr) {

                return callback(checkErr);

            }

            // Already viewed
            if (checkResults.length > 0) {

                return callback(null, {
                    message: 'Story already viewed'
                });

            }

            // Save view
            db.query(
                `
                INSERT INTO story_views (
                    story_id,
                    viewer_id
                )
                VALUES (?, ?)
                `,
                [storyId, viewerId],
                (err, result) => {

                    callback(err, result);

                }
            );

        }
    );

}

// Get story viewers
function getStoryViews(storyId, callback) {

    db.query(
        `
        SELECT
            story_views.*,

            ccl_users.username,
            ccl_users.profile_picture

        FROM story_views

        LEFT JOIN ccl_users
            ON story_views.viewer_id = ccl_users.id

        WHERE story_views.story_id = ?

        ORDER BY story_views.viewed_at DESC
        `,
        [storyId],
        (err, results) => {

            callback(err, results);

        }
    );

}

// Delete story
function deleteStory(id, callback) {

    db.query(
        `
        DELETE FROM stories
        WHERE id = ?
        `,
        [id],
        (err, result) => {

            callback(err, result);

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