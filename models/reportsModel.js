const db = require('../services/database')

// Create report
function createReport(reportData, callback) {

    const {
        reporter_id,
        target_type,
        target_id,
        reason
    } = reportData;

    db.query(
        `
        INSERT INTO reports (
            reporter_id,
            target_type,
            target_id,
            reason
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            reporter_id,
            target_type,
            target_id,
            reason
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Get all reports
function getAllReports(callback) {

    db.query(
        `
        SELECT
            reports.*,

            ccl_users.username AS reporter_username,
            ccl_users.profile_picture

        FROM reports

        LEFT JOIN ccl_users
            ON reports.reporter_id = ccl_users.id

        ORDER BY reports.created_at DESC
        `,
        (err, results) => {

            callback(err, results);

        }
    );

}

// Update report status
function updateReportStatus(
    reportId,
    status,
    callback
) {

    db.query(
        `
        UPDATE reports
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            reportId
        ],
        (err, result) => {

            callback(err, result);

        }
    );

}

// Delete report
function deleteReport(reportId, callback) {

    db.query(
        `
        DELETE FROM reports
        WHERE id = ?
        `,
        [reportId],
        (err, result) => {

            callback(err, result);

        }
    );

}

module.exports = {
    createReport,
    getAllReports,
    updateReportStatus,
    deleteReport
};