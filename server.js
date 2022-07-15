const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors')
const device = require('express-device');
const path = require('path');
const bodyParser = require('body-parser');

// TODO: Add logging.

const { HOST, USER, PASSWORD, DATABASE } = process.env;

const db = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log(`Successfully connected to the database!`);
})
dotenv.config({ path: './config/config.env' });

const app = express();
app.use(cors())
app.use(device.capture());
app.use(bodyParser.json()); // Support JSON encoded bodies.
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies.

// Create a DB.
app.get('/createDB', (req, res) => {
    db.query(`CREATE DATABASE ${DATABASE}`, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Database created successfully!');
    });
});

// Create table if not exists.
app.get('/createPostTable', (req, res) => {
    db.query('CREATE TABLE [IF NOT EXISTS] posts(id int AUTO_INCREMENT, country VARCHAR(255), states VARCHAR(255), PRIMARY KEY(id))', (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Post table created!');
    });
});

// User request for data.
app.get('/countryCode', (req, res) => {
    const { name } = req.query;
    db.query(`SELECT  count(country_code) AS numCount,(country_code), imgURL  FROM CITIES WHERE NAME LIKE '${name}%' group by country_Code order by count(*) desc LIMIT 10`, [name], (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

// Get cookie data from DB.
app.get('/history', (req, res) => {
    let { id } = req.query;
    db.query(`SELECT history, userID FROM userdata  WHERE gId = ${id} ORDER BY userID DESC LIMIT 10`, [id], (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

// User request to POST cookie data to DB.
app.post('/addCookie', (req, res) => {
    const { history, gId, email } = req.body;
    db.query(`INSERT INTO userdata (history, gId, email) VALUES ("${history}", "${gId}", "${email}")`, [history, gId, email], (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

// User request to remove history from DB.
app.post('/removeHistory', (req, res) => {
    const { history, gId } = req.body;
    db.query(`DELETE FROM userdata WHERE gId=${history} AND history ="${gId}"`, [history, gId], (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

// User request for trending values on page load.
app.get('/', (req, res) => {
    if (req.acceptsLanguages()[0] === 'en-US') {
        const userAgent = req.headers['user-agent']
        if (userAgent.indexOf('Mobile') !== -1) {
            res.sendFile(path.join(__dirname, '/mobile/index.html'));
        }
        if (userAgent.indexOf('Mobile') === -1) {
            res.sendFile(path.join(__dirname, '/desktop/index.html'));
        }
    }
});

// User request for trending values on page load.
app.get('/fullScreen', (req, res) => {
    const userAgent = req.headers['user-agent']
    if (userAgent.indexOf('Mobile') !== -1) {
        res.sendFile(path.join(__dirname, '/mobile/fullScreen.html'));
    }
    if (userAgent.indexOf('Mobile') === -1) {
        res.sendFile(path.join(__dirname, '/desktop/index.html'));
    }
});

const PORT = process.env.PORT || 3000;

const searchController = require('./searchController');
app.route('/search').get(searchController.search);
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
app.use('/static', express.static('static'));


