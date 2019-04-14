const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cheerio = require('cheerio');
const {Pool, Client} = require('pg');

var conString = "postgres://YourUserName:YourPassword@localhost:5432/YourDatabase";

var config = {
    user: 'foo',
    database: 'mydb',
    password: 'password',
    host: 'localhost',
    port: 5432,
}

const pool = new Pool(config);

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
    pool.end();
});

var app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello');
});

// app.post('/', (req, res) => {
//     var url = req.body.url;
//     res.send(url);
//     request(url, (err, res, body) => {
//         if(err) {
//             return console.log('Error\n', err);
//         }
//         //console.log(res.request.uri);
//         var $ = cheerio.load(body);
//         console.log($('head').children('title').html());
//     });
// });

//get all links
app.get('/links', (req, res) => {

});

//add new link
app.post('/links', (req, res) => {

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
    console.log('Listening on port 3000');
});