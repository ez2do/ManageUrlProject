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
]);

dotenv.config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ManageUrlProject',
    password: 'tuananh123',
    port: 5432
});

var postLink = async (targetUrl, domain_table, url_table, res) => {
    try {
        //get information from url
        var link = await got(targetUrl);
        var link_info = await metascraper({ html: link.body, url: link.url });
        //get information from domain
        var domain = await got(extractDomain(targetUrl));
        var domain_info = await metascraper({ html: domain.body, url: domain.url });

        //add domain to database
        await pool.query({
            text: `SELECT * FROM ${domain_table} WHERE name = $1`,
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
                        ${domain_table}(name, title, logo_link, img_link, description, publisher)
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
            text: `SELECT id FROM ${domain_table} WHERE name = $1`,
            values: [domain_info.url]
        }).then((result) => {
            domain_id = result.rows[0].id;
        }).catch((err) => {
            console.log('Can not get domain id\n', err);
        });

        //check whether url already exists in the database
        await pool.query({
            text: `SELECT * FROM ${url_table} WHERE url = $1`,
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
                                ${url_table}(url, title, logo_link, img_link, description, publisher, collection_id, domain_id)
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
            console.log('Fail in inserting url to database');
            return res.send({ success: false, error: err });
        });
    } catch (err) {
        console.log('Catch exception\n', err);
        return res.send({ success: false, error: err });
    }
};

var postCollection = (table, name, res) => {
    pool.query({
        text: `SELECT * FROM ${table} WHERE name = $1`,
        values: [name]
    }).then((result) => {
        if (result.rowCount > 0) {
            res.send({
                success: true,
                message: 'Name has been use. Try other name. Success just means I got the request'
            });
            return false;   //not adding to database
        }
        return true;
    }).then((result) => {
        if (result) {
            pool.query({
                text: `INSERT INTO ${table}(name) VALUES($1)`,
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
        console.log('Add new collection occur exception\n', err);
        res.send({
            success: false,
            error: err
        });
    });
}

var getAll = (table, res) => {
    pool.query({
        text: `SELECT * FROM ${table}`
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
};

var getById = (table, id, res) => {
    pool.query({
        text: `SELECT * FROM ${table} WHERE id = $1`,
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
};

var deleteById = (table, id, res) => {
    pool.query({
        text: `DELETE FROM ${table} WHERE id = $1`,     //maybe need to add ON CASCADE
        values: [id]
    }).then((result) => {
        res.send({
            success: true,
            result: result
        });
    }).catch((err) => {
        console.log("Error in deleting row");
        res.send({
            success: false,
            error: err
        });
    });
};

var getAllLinksOfCollection = (table, collection_id, res) => {
    pool.query({
        text: `SELECT * FROM ${table} WHERE collection_id = $1`,
        values: [collection_id]
    }).then((result) => {
        if (result.rowCount == 0) {
            console.log('There is no links in this collection');
            res.send({
                success: false,
                message: 'There is no links in this collection'
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
};

var updateCollectionOfALink = (url_table, link_id, collection_id, res) => {
    pool.query({
        text: `UPDATE ${url_table} SET collection_id = $1 WHERE id = $2`,
        values: [collection_id, link_id]
    }).then((result) => {
        res.send({
            success: true,
            message: 'Update succefully'
        })
    }).catch((err) => {
        console.log('Fail to update collection');
        res.send({
            success: false,
            error: err
        });
    });
};

var updateCollection = (collection_table, collection_id, new_name, res) => {
    pool.query({
        text: `UPDATE ${collection_table} SET name = $1 WHERE id = $2`,
        values: [new_name, collection_id]
    }).then((result) => {
        res.send({
            success: true,
            result: result
        });
    }).catch((err) => {
        console.log('Unable to update collection\n', err);
        res.send({
            success: false,
            error: err
        });
    });
};

module.exports = { postLink, postCollection, getAll, getById, deleteById, getAllLinksOfCollection, 
    updateCollectionOfALink, updateCollection };