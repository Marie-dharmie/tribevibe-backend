// ---- MAIN IMPORTS (backend setup, controllers, middleware) ----

// Import JWT authentication middleware
const { authenticateJWT } = require('./services/authentication');

const {
    requireAdmin,
    requireModerator
} = require('./middlewares/roles');

const express = require('express');
// MySQL connection (configured in /services/database.js)
const db = require('./services/database');
// CORS allows backend to accept requests from your frontend (different port)
const cors = require('cors');
// Path for file/directory manipulation (used to serve static files)
const path = require('path');
const helmet = require('helmet');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        error: 'Too many requests. Try again later.'
    }
});
// Import all route controllers
const commentsController = require('./controllers/commentsController');
const eventsController = require('./controllers/eventsController');
const postsController = require('./controllers/postsController');
const friendsController = require('./controllers/friendsController');
const usersController = require('./controllers/usersController');
const calendarEventsController = require('./controllers/calendarEventsController');
const postLikesController = require('./controllers/postLikesController');
const notificationsController = require('./controllers/notificationsController');
const roomsController = require('./controllers/roomsController');
const reportsController = require('./controllers/reportsController');
const storiesController = require('./controllers/storiesController');
// Parse cookies for login/authentication
const cookieParser = require('cookie-parser');
// Multer handles file/image uploads
const upload = require('./middlewares/upload');

// Define port (3001 for backend, 5177 for frontend)
const port = 3001;
const app = express();
app.set('trust proxy', 1);
const {
    checkAccountStatus
} = require('./middlewares/accountStatus');

// ---- GLOBAL MIDDLEWARE ----
// Allow requests from any frontend, send cookies, allow credentials
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://tribevibe.eu",
        "https://www.tribevibe.eu"
    ],
    credentials: true
}));
// Parse incoming JSON in all requests
app.use(express.json());
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(limiter);
// Parse cookies for auth
app.use(cookieParser());
// Make files in /uploads accessible at http://localhost:3001/uploads/...
app.use('/uploads', express.static('uploads'));



// ---------------------------------------------------------------
//                       ROUTE DEFINITIONS
// ---------------------------------------------------------------

// ------- GET ROUTES -------
// Fetch all events (for events feed, calendar, etc.)
app.get('/api/events', eventsController.getAllEvents);
app.get(
    '/api/events/trending',
    eventsController.getTrendingEvents
);
// Get all events for a specific room
app.get('/api/rooms/:roomId/events', eventsController.getEventsByRoom);
// Get comments for a specific post
app.get('/api/posts/:postId/comments', commentsController.getCommentsByPost);
// Fetch all posts (for main feed)
app.get('/api/posts', postsController.getAllPosts);
// Get user's accepted friends (for stories bar, feed, etc.)
// Get all posts for a specific room
app.get('/api/rooms/:roomId/posts', postsController.getPostsByRoom);
app.get('/api/friends/:userId', friendsController.getFriends);
// Get friend requests sent to a user (for notifications/invites)
app.get('/api/friends/requests/:userId', friendsController.getFriendRequests);
// Get friend requests sent BY a user (for showing outgoing requests)
app.get('/api/friends/sent/:userId', friendsController.getSentFriendRequests);
// Get list of all users (for suggestions, admin)
app.get('/api/users', usersController.getAllUsers);
app.get(
    '/api/users/suggestions/:userId',
    usersController.getFriendSuggestions
);
app.get(
    '/api/friends/mutual/:userId/:targetUserId',
    friendsController.getMutualFriends
);
// Get a single user's data by their ID
app.get('/api/users/:id', usersController.getUserById);
// Get all events a user is attending (user's calendar)
app.get('/api/calendar/:userId', calendarEventsController.getUserCalendarEvents);

// Get the logged-in user's info (requires valid JWT in cookie)
app.get('/api/users/me', authenticateJWT, (req, res) => {
    res.json({ user: req.user });
});
// Get all users with their "friend status" (so you can show: already friends, request sent, etc.)
app.get('/api/users/all-with-status/:userId', usersController.getAllUsersWithFriendStatus);

// Post "like" info for a post (total count)
app.get('/api/posts/:postId/likes/count', postLikesController.getLikeCount);
// Check if user has liked a post (for "liked" state on frontend)
app.get('/api/posts/:postId/likes/:userId', postLikesController.hasUserLiked);
// ------- ROOM GET ROUTES -------

// Get all rooms
app.get('/api/rooms', roomsController.getAllRooms);
app.get(
    '/api/rooms/recommended/:userId',
    roomsController.getRecommendedRooms
);
// Get one room by ID
app.get('/api/rooms/:id', roomsController.getRoomById);

// Search rooms
app.get('/api/rooms/search/query', roomsController.searchRooms);

// Get all members in a room
app.get('/api/rooms/:roomId/members', roomsController.getRoomMembers);

// Get pending room join requests
app.get('/api/rooms/:roomId/join-requests', roomsController.getRoomJoinRequests);
// Get notifications for a user
app.get('/api/notifications/:userId', notificationsController.getNotifications);

app.get(
    '/api/posts/:postId',
    postsController.getPostById
);
app.get(
    '/api/stories',
    storiesController.getActiveStories
);
app.get(
    '/api/stories/:storyId/views',
    storiesController.getStoryViews
);
app.get(
    '/api/reports',
    reportsController.getAllReports
);
// ------- POST ROUTES -------
// Add a new user (used for admin only, not registration)
app.post('/api/users', usersController.createUser);
// Create a new event (uploads an image too if provided)
app.post('/api/events', upload.single('image'), eventsController.createEvent);
// Create a comment
app.post(
    '/api/comments',
    checkAccountStatus,
    commentsController.createComment
);
// RSVP/join an event (add row to calendar_events)
app.post('/api/calendar', calendarEventsController.createCalendarEvent);


// Send a friend request
app.post('/api/friends', friendsController.createFriendRequest);
// Register a new user (with profile image)
app.post('/api/users/register', upload.single('image'), usersController.register);
// Like/unlike a post
app.post('/api/posts/:postId/like', postLikesController.likePost);
app.post('/api/posts/:postId/unlike', postLikesController.unlikePost);
// Create a room
app.post(
    '/api/rooms',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    checkAccountStatus,
    roomsController.createRoom
);

// Join a room
app.post('/api/rooms/:roomId/join', roomsController.joinRoom);

// Leave a room
app.post('/api/rooms/:roomId/leave', roomsController.leaveRoom);
// ----- SPECIAL UPLOAD ENDPOINTS (for image changes on profile, events, posts) -----

// User uploads/changes profile picture
app.post('/api/users/:id/profile-picture', upload.single('image'), (req, res) => {
    const userId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename;
    db.query(
        'UPDATE ccl_users SET profile_picture = ? WHERE id = ?',
        [filename, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to update profile picture' });
            res.json({ message: 'Profile picture uploaded!', filename });
        }
    );
});

// Event organizer uploads/changes event image
app.post('/api/events/:id/image', upload.single('image'), (req, res) => {
    const eventId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename;
    db.query('UPDATE events SET image = ? WHERE id = ?', [filename, eventId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update event image' });
        res.json({ message: 'Event image uploaded!', filename });
    });
});

// User uploads/changes image on a post
app.post('/api/posts/:id/image', upload.single('image'), (req, res) => {
    const postId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename;
    db.query('UPDATE post SET image = ? WHERE id = ?', [filename, postId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update post image' });
        res.json({ message: 'Post image uploaded!', filename });
    });
});

// Login: check email/password, return JWT as cookie on success
app.post('/api/users/login', usersController.login);
// Remove an RSVP (user leaves event)
app.post('/api/calendar/remove', calendarEventsController.removeCalendarEvent);

// Approve room join request
app.post('/api/rooms/join-requests/:requestId/approve', roomsController.approveJoinRequest);

// Reject room join request
app.post('/api/rooms/join-requests/:requestId/reject', roomsController.rejectJoinRequest);
// Create notification
app.post('/api/notifications', notificationsController.createNotification);
app.post(
    '/api/stories',
    upload.single('media'),
    checkAccountStatus,
    storiesController.createStory
);
app.post(
    '/api/stories/:storyId/view',
    storiesController.viewStory
);
app.post(
    '/api/reports',
    reportsController.createReport
);
app.post(
    '/api/posts',
    upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 5 }
    ]),
    checkAccountStatus,
    postsController.createPost
);
// ------- PUT ROUTES (update existing data) -------
// Update user info (bio, email, etc.)
app.put('/api/users/:id', usersController.updateUser);
// Update event info (title, date, etc.)
app.put('/api/events/:id', eventsController.updateEvent);
// Update RSVP in calendar_events (usually not used)
app.put('/api/calendar/:id', calendarEventsController.updateCalendarEvent);
// Update a post (content, event tag, etc.)
app.put('/api/posts/:id', postsController.updatePost);
// Update a friend request (accept, decline, block)
app.put('/api/friends/:id', friendsController.updateFriendStatus);
// Update comment
app.put('/api/comments/:id', commentsController.updateComment);
// Mark notification as read
app.put('/api/notifications/:id/read', notificationsController.markNotificationAsRead);
app.put(
    '/api/reports/:id/status',
    reportsController.updateReportStatus
);
// --------------------------------------------------
// ADMIN & MODERATOR ROUTES
// --------------------------------------------------

// Ban user
app.put(
    '/api/admin/users/:id/ban',
    authenticateJWT,
    requireAdmin,
    usersController.banUser
);

// Mute user
app.put(
    '/api/admin/users/:id/mute',
    authenticateJWT,
    requireModerator,
    usersController.muteUser
);

// Unmute user
app.put(
    '/api/admin/users/:id/unmute',
    authenticateJWT,
    requireModerator,
    usersController.unmuteUser
);

// Promote moderator
app.put(
    '/api/admin/users/:id/promote',
    authenticateJWT,
    requireAdmin,
    usersController.promoteModerator
);

// Remove moderator
app.put(
    '/api/admin/users/:id/demote',
    authenticateJWT,
    requireAdmin,
    usersController.removeModerator
);
// ------- DELETE ROUTES (remove stuff from DB) -------
// Delete user (admin only, or user account deletion)
app.delete('/api/users/:id', usersController.deleteUser);
// Delete event (admin or event owner)
app.delete('/api/events/:id', eventsController.deleteEvent);
// Remove event from user's calendar (un-RSVP)
app.delete('/api/calendar/:id', calendarEventsController.deleteCalendarEvent);
// Delete post
app.delete('/api/posts/:id', postsController.deletePost);
// Delete/remove/block a friend/friend request
app.delete('/api/friends/:id', friendsController.deleteFriend);
// Delete comment
app.delete('/api/comments/:id', commentsController.deleteComment);
// Delete notification
app.delete('/api/notifications/:id', notificationsController.deleteNotification);
app.delete(
    '/api/stories/:id',
    storiesController.deleteStory
);
app.delete(
    '/api/reports/:id',
    reportsController.deleteReport
);
// --- Extra info for event/post details ---
app.get('/api/events/:eventId/attendees/count', calendarEventsController.getEventAttendeeCount); // attendee count for an event
app.get('/api/posts/:postId/likers', postLikesController.getLikers); // who liked a post

// ---------------------------------------------------------------
//                SERVE FRONTEND (React app build)
// ---------------------------------------------------------------

// Serve static files from frontend (built React app)
// E.g., if someone requests /, /calendar, /vibe-feed, this serves index.html, letting React handle routing.
/*
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For all remaining requests (not matching above), send the main index.html
// This is for React Router to handle client-side navigation.
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});
*/

// ---------------------------------------------------------------
//                   START THE SERVER
// ---------------------------------------------------------------

// Listen on port 3001 for all incoming API and static file requests
app.listen(port, () => {
    console.log((`server listening at http://localhost:${port}`));
});
