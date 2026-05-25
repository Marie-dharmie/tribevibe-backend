const db = require('../services/database')

function checkAccountStatus(
    req,
    res,
    next
) {

    const userId = req.body?.user_id;

    // SAFETY CHECK
    if (!userId) {

        return res.status(400).json({
            error: 'user_id is required'
        });

    }

    db.query(
        `
        SELECT account_status
        FROM ccl_users
        WHERE id = ?
        `,
        [userId],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    error: err
                });

            }

            // USER NOT FOUND
            if (results.length === 0) {

                return res.status(404).json({
                    error: 'User not found'
                });

            }

            const user = results[0];

            // MUTED
            if (
                user.account_status === 'muted'
            ) {

                return res.status(403).json({
                    error: 'Account is muted'
                });

            }

            // BANNED
            if (
                user.account_status === 'banned'
            ) {

                return res.status(403).json({
                    error: 'Account is banned'
                });

            }

            next();

        }
    );

}

module.exports = {
    checkAccountStatus
};