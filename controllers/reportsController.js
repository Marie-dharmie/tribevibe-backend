const reportsModel = require('../models/reportsModel');

// Create report
function createReport(req, res) {

    const {
        reporter_id,
        target_type,
        target_id,
        reason
    } = req.body;

    reportsModel.createReport(
        {
            reporter_id,
            target_type,
            target_id,
            reason
        },
        (err, result) => {

            if (err) {

                console.log(
                    'CREATE REPORT ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Report submitted!',
                    reportId: result.insertId
                });

            }

        }
    );

}

// Get all reports
function getAllReports(req, res) {

    reportsModel.getAllReports(
        (err, reports) => {

            if (err) {

                console.log(
                    'GET REPORTS ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json(reports);

            }

        }
    );

}

// Update report status
function updateReportStatus(req, res) {

    const reportId = req.params.id;
    const { status } = req.body;

    reportsModel.updateReportStatus(
        reportId,
        status,
        (err, result) => {

            if (err) {

                console.log(
                    'UPDATE REPORT STATUS ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Report updated!'
                });

            }

        }
    );

}

// Delete report
function deleteReport(req, res) {

    const reportId = req.params.id;

    reportsModel.deleteReport(
        reportId,
        (err, result) => {

            if (err) {

                console.log(
                    'DELETE REPORT ERROR:',
                    err
                );

                res.status(500).json({
                    error: err
                });

            } else {

                res.json({
                    message: 'Report deleted!'
                });

            }

        }
    );

}

module.exports = {
    createReport,
    getAllReports,
    updateReportStatus,
    deleteReport
};