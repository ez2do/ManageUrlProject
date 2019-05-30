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

var postLink = async (targetUrl, url_table, url_info_table, res) => {
    try {
        //put to url table
        await pool.query({
            text: `INSERT INTO ${url_table}(name) VALUES($1) ON CONFLICT DO NOTHING`,
            values: [targetUrl]
        });

        //get information from url
        var link = await got(targetUrl);
        var link_info = await metascraper({ html: link.body, url: link.url });

        //check whether url already exists in the database
        await pool.query({
            text: `INSERT INTO 
                        ${url_info_table}(url, title, logo_link, img_link, description, publisher)
                        VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
            values: [link.url, link_info.title, link_info.logo, link_info.image, link_info.description,
            link_info.publisher]
        }).then(() => {
            res.send(link_info);
        })
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

var addDomain = async (domain, domain_table, res) => {
    try {
        //get information from domain
        var domain = await got(extractDomain(domain));
        var domain_info = await metascraper({ html: domain.body, url: domain.url });

        //add domain to database
        await pool.query({
            text: `INSERT INTO 
                ${domain_table}(name, title, logo_link, img_link, description, publisher)
                VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
            values: [domain_info.url, domain_info.title, domain_info.logo, domain_info.image,
            domain_info.description, domain_info.publisher]
        }).then((result) => {
            res.send(domain_info);
        });
    } catch(err){
        res.send({
            success: false,
            message: 'Catch error when inserting domain'
        })
    }
}

var addDailyDomain = (domain, daily_domain_table, res) => {
    pool.query({
        text: `INSERT INTO ${daily_domain_table}(name, visitCount, duration, date)
            VALUES($1, $2, $3, $4)`,
        values: [domain.name, domain.visit, domain.duration, domain.date]
    }).then((result) => {
        res.send({
            success: true,
            message: 'add daily_domain successfully'
        });
    }).catch((err) => {
        res.send({
            success: false,
            message: 'fail to add daily domain'
        })
    })
}

module.exports = {
    postLink, postCollection, getAll, getById, deleteById, getAllLinksOfCollection,
    updateCollectionOfALink, updateCollection, addDomain, addDailyDomain
};