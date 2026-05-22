require('dotenv').config();

const mysql = require('mysql2');

const config = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

config.connect(function (err) {

    if (err) {

        console.log('DATABASE CONNECTION ERROR:', err);
        return;

    }

    console.log('Connected to HelloHoly database');

});

module.exports = { config };