const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const extractDomain = require('extract-domain');
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
        `SELECT * FROM url_info`
    ).then((result) => {
        res.send({
            rowCount: result.rowCount,
            rows: result.rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

//add new link
app.post('/links', (req, res) => {
    var targetUrl = req.body.url;
    (async () => {
        try {
            //get information from url
            var link = await got(targetUrl);
            var link_info = await metascraper({ html: link.body, url: link.url });
            //get information from domain
            var domain = await got(extractDomain(targetUrl));
            var domain_info = await metascraper({ html: domain.body, url: domain.url });

            //add domain to database
            await pool.query({
                text: `SELECT * FROM domain_info WHERE name = $1`,
                values: [domain_info.url]
            }).then((result) => {
                if (result.rowCount !== 0) {
                    console.log('Domain already in the database');
                    return false;   //stop insert
                }
                return true;   //insert
            }).then((result) => {
                if (result) {
                    pool.query({
                        text: `INSERT INTO 
                        domain_info(name, title, logo_link, img_link, description, publisher)
                        VALUES($1, $2, $3, $4, $5, $6)`,
                        values: [domain_info.url, domain_info.title, domain_info.logo, domain_info.image,
                        domain_info.description, domain_info.publisher]
                    });
                }
            }).catch((err) => {
                console.log('Fail to insert domain\n', err);
            });

            //get id of domain
            var domain_id;
            await pool.query({
                text: `SELECT id FROM domain_info WHERE name = $1`,
                values: [domain_info.url]
            }).then((result) => {
                domain_id = result.rows[0].id;
            }).catch((err) => {
                console.log('Can not get domain id\n', err);
            })

            //check whether url already exists in the database
            await pool.query({
                text: `SELECT * FROM url_info WHERE url = $1`,
                values: [link.url]
            }).then((result) => {
                if (result.rowCount !== 0) {
                    console.log('Url exists in the database');
                    res.send({
                        success: true,
                        exists: true
                    });
                    return false;   //stop insert
                }
                return true;    //do insert into table
            }).then((result) => {
                if (result) {
                    pool.query({
                        text: `INSERT INTO 
                                url_info(url, title, logo_link, img_link, description, publisher, collection_id, domain_id)
                                VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                        values: [link.url, link_info.title, link_info.logo, link_info.image, link_info.description,
                        link_info.publisher, 1, domain_id]
                    }).then(() => {
                        res.send(link_info);
                    }).catch((err) => {
                        res.send({ success: false, error: err });
                    });
                }
            }).catch((err) => {
                return res.send({ success: false, error: err });
            });
        } catch (err) {
            console.log(err);
            return res.send({ success: false, error: err });
        }
    })()
});

//info about 1 link
app.get('/links/:id', (req, res) => {
    var id = req.params.id;
    pool.query({
        text: `SELECT * FROM url_info WHERE id = $1`,
        values: [id]
    }).then((result) => {
        res.send({
            rowCount: result.rowCount,
            rows: result.rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

//insert or remove 1 link from a collection by change property "is_favorite"
app.put('/links/:id', (req, res) => {

});

//delete 1 link
app.delete('/links/:id', (req, res) => {
    pool.query({
        text: `DELETE FROM url_info WHERE id = ${req.params.id}`
    }).then((result) => {
        res.send({
            success: true,
            result: result
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

//add 1 link to collection
app.post('/links/:id/:collection_id', (req, res) => {

});

//get all collections
app.get('/collections', (req, res) => {

});

//add new collection
app.post('/collections', (req, res) => {
    var name = req.body.name;
    pool.query({
        text: `SELECT * FROM collection WHERE name = $1`,
        values: [name]
    }).then((result) => {
        if(result.rowCount > 0){
            res.send({
                success: true,
                message: 'Name has been use. Try other name. Success just means I got the request'
            });
            return false;   //not adding to database
        }
        return true;
    }).then((result) => {
        if(result){
            pool.query({
                text: `INSERT INTO collection(name) VALUES($1)`,
                values: [name]
            }).then((result) => {
                console.log('Add new collection succefully');
                res.send({
                    success: true,
                    rowCount: result.rowCount,
                    rows: result.rows
                });
            }).catch((err) => {
                console.log('Fail to add new collection');
                res.send({
                    success: false,
                    error: err
                });
            });
        }
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
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

app.listen(9999, () => {
    console.log('Listening on port 9999');
});