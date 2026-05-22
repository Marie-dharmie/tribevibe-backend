function requireAdmin(req, res, next) {

    // No logged in user
    if (!req.user) {

        return res.status(401).json({
            error: 'Authentication required'
        });

    }

    // Not admin
    if (req.user.role !== 'admin') {

        return res.status(403).json({
            error: 'Admin access required'
        });

    }

    next();

}

function requireModerator(req, res, next) {

    // No logged in user
    if (!req.user) {

        return res.status(401).json({
            error: 'Authentication required'
        });

    }

    // Allow moderator OR admin
    if (
        req.user.role !== 'moderator'
        &&
        req.user.role !== 'admin'
    ) {

        return res.status(403).json({
            error: 'Moderator access required'
        });

    }

    next();

}

module.exports = {
    requireAdmin,
    requireModerator
};