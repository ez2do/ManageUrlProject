const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const utils = require('./utils/server_utils');

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

app.listen(9999, () => {
    console.log('Listening on port 9999');
});