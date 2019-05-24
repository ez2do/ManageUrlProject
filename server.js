const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const https = require('https');
const utils = require('./utils/server_utils');
const cors = require('cors');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
// const dotenv = require('dotenv');

var certOptions = {
    key: fs.readFileSync(path.resolve('./server.key')),
    cert: fs.readFileSync(path.resolve('./server.crt'))
}

// dotenv.config();

//connect to database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ManageUrlProject',
    password: 'tuananh123',
    port: 5432
});

pool.on('connect', () => {
    console.log('Connect to the database');
});

var app = express();

app.use(bodyParser.json());
app.use(cors());

//de day cho do trong trang chu
app.get('/', (req, res) => {
    console.log('fail');
    res.send('fail');
    //utils.getAll('url_info', res);
});

//get all links
app.get('/links', (req, res) => {
    utils.getAll('url_info', res);
});

//add new link
app.post('/links', (req, res) => {
    var targetUrl = req.body.url;
    utils.postLink(targetUrl, 'domain_info', 'url_info', res);
});

//info about 1 link
app.get('/links/:id', (req, res) => {
    var id = req.params.id;
    utils.getById('url_info', id, res);
});

//delete 1 link
app.delete('/links/:id', (req, res) => {
    var id = req.params.id;
    utils.deleteById('url_info', id, res);
});

//add 1 link to collection
app.post('/links/:id/:collection_id', (req, res) => {
    var link_id = req.params.id;
    var collection_id = req.params.collection_id;
    utils.updateCollectionOfALink('url_info', link_id, collection_id, res);
});

//get all collections
app.get('/collections', (req, res) => {
    utils.getAll('collection', res);
});

//add new collection
app.post('/collections', (req, res) => {
    var name = req.body.name;
    utils.postCollection('collection', name, res);
});

//get info of 1 collection
app.get('/collections/:id', (req, res) => {
    var id = req.params.id;
    utils.getById('collection', id, res);
});

//update info of 1 collection
app.put('/collections/:id', (req, res) => {
    var id = req.params.id;
    var new_name = req.body.name;
    utils.updateCollection('collection', id, new_name, res);
});

//delete collection
app.delete('/collections/:id', (req, res) => {
    var id = req.params.id;
    utils.deleteById('collection', id, res);
});

//get all links in 1 collection
app.get('/collections/all/:collection_id', (req, res) => {
    var collection_id = req.params.collection_id;
    utils.getAllLinksOfCollection('url_info', collection_id, res);
});

//remove 1 link from a collection by set its collection_id to 1
app.delete('/collections/:collection_id/:link_id', (req, res) => {
    var collection_id = req.params.collection_id;
    var link_id = req.params.link_id;
    //set collection_id to 1
    utils.updateCollectionOfALink('url_info', link_id, 1, res);
});

//get all daily domains in 1 day
app.get('/daily_domains/:date', (req, res) => {
    //form of date: 'yyyy-mm-dd'
    var date = moment(req.params.date, 'YYYY-MM-DD HH:mm:ss');
    if (!date.isValid()) {
        return res.send({
            success: false,
            message: 'Date param is not valid'
        });
    }
    console.log(date);
    pool.query({
        text: `SELECT * FROM daily_domain WHERE DATE_TRUNC('day', date) = $1`,
        values: [date]
    }).then((result) => {
        if (result.rowCount == 0) {
            console.log('There is no domain today');
            res.send({
                success: false,
                message: 'There is no domain today'
            });
        } else {
            res.send({
                success: true,
                rowCount: result.rowCount,
                rows: result.rows
            });
        }
    }).catch((err) => {
        console.log('Catch an error\n', err);
        res.send({
            success: false,
            error: err
        });
    });
});

app.post('/daily_domains', (req, res) => {
    var domain = req.body.domain;
    //get domain id
    pool.query({
        text: `SELECT id FROM domain_info WHERE name = $1`,
        values: [domain.name]
    }).then((result) => {
        if (result.rowCount == 0) {
            console.log('There is no such domain');
            res.send({
                success: false,
                message: 'There is no such domain, it must be insert when inserting url'
            })
        } else {
            console.log('result format:', result);
            pool.query({
                text: `INSERT INTO daily_domain(date, visitCount, duration, domain_id)
                            VALUES($1, $2, $3, $4)`,
                values: [domain.date, domain.visit, domain.duration, result.rows[0].id]
            });
            res.send({
                success: true,
                message: 'insert successfully',
                rowCount: result.rowCount,
                rows: result.rows
            });
        }
    }).catch((err) => {
        console.log('Catch an error\n', err);
        res.send({
            success: false,
            error: err
        });
    });
});

app.post('/links/record', (req, res) => {
    var urlObj = req.body;
    console.log('Url object: ', urlObj);
    var name = urlObj.url;
    var startTime = moment(urlObj.startTime, 'D/M/YYYY h:m:s').format('DD/MM/YYYY hh:mm:ss');
    var endTime = moment(urlObj.endTime, 'D/M/YYYY h:m:s').format('DD/MM/YYYY hh:mm:ss');
    pool.query({
        text: `INSERT INTO url_visit(name, startVisitAt, endVisitAt) VALUES($1, $2, $3)`,
        values: [name, urlObj.startTime, endTime]
    }).then(() => {
        res.send({
            success: true,
            message: 'Add succefully'
        });
    }).catch((err) => {
        res.send({
            success: false,
            message: 'Error occur when add url to history',
            error: err
        });
    });
});

var server = https.createServer(certOptions, app, () => {
    console.log('Listening on port 9999');
}).listen(9999);