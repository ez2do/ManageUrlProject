const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const got = require('got');
const metascraper = require('metascraper')([
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
])

dotenv.config();

//connect to database
const pool = new Pool({
    connectionString: process.env.LOCAL_DB
});

pool.on('connect', () => {
    console.log('Connect to the database');
});

var app = express();

app.use(bodyParser.json());

//get all links
app.get('/links', (req, res) => {
    pool.query(
        `SELECT * FROM url`
    ).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send('Error occurs\n', err);
    });
});

//add new link
app.post('/links', (req, res) => {
    var targetUrl = req.body.url;
    (async () => {
        try {
            const { body: html, url } = await got(targetUrl);
            const metadata = await metascraper({ html, url })
            res.send(metadata)
        } catch (err) {
            res.send({errorName: err.name, errorCode: err.code});
        }
    })()
});

//info about 1 link
app.get('/links/:id', (req, res) => {

});

//insert or remove 1 link from a collection by change property "is_favorite"
app.put('/links/:id', (req, res) => {

});

//delete 1 link
app.delete('/links/:id', (req, res) => {

});

//add 1 link to collection
app.post('/links/:id/:collection_id', (req, res) => {

});

//get all collections
app.get('/collections', (req, res) => {

});

//add new collection
app.post('/collections', (req, res) => {

});

//get info of 1 collection
app.get('/collections/:id', (req, res) => {

});

//update info of 1 collection
app.put('/collections/:id', (req, res) => {

});

//delete collection
app.delete('/collections/:id', (req, res) => {

});

//get all links in 1 collection
app.get('/collections/:collection_id', (req, res) => {

});

//delete 1 link from collection
app.delete('/collections/:collection_id/:link_id', (req, res) => {

});

app.listen(1212, () => {
    console.log('Listening on port 1212');
});