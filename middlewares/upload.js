const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({

    // Upload destination
    destination: function (req, file, cb) {

        cb(null, 'uploads/');

    },

    // Unique filename
    filename: function (req, file, cb) {

        const uniqueSuffix =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueSuffix +
            path.extname(file.originalname)
        );

    }

});

// Allow BOTH images and videos
const fileFilter = (req, file, cb) => {

    // IMAGE FILES
    if (
        file.mimetype.startsWith('image/')
    ) {

        cb(null, true);

    }

    // VIDEO FILES
    else if (
        file.mimetype.startsWith('video/')
    ) {

        cb(null, true);

    }

    // INVALID FILE TYPE
    else {

        cb(
            new Error(
                'Only image and video files are allowed!'
            ),
            false
        );

    }

};

// Multer upload middleware
const upload = multer({

    storage,
    fileFilter,

    // Optional upload size limit
    limits: {
        fileSize: 1024 * 1024 * 100 // 100MB
    }

});

module.exports = upload;