const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.LOCAL_DB
});

var checkExist = (table, column, value) => {
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
        if(result){
            pool.query({
                text: `INSERT INTO 
                        url_info(url, title, logo_link, img_link, description, publisher)
                        VALUES($1, $2, $3, $4, $5, $6)`,
                values: [link.url, link_info.title, link_info.logo, link_info.image, link_info.description,
                link_info.publisher]
            }).then(() => {
                res.send(link_info);
            }).catch((err) => {
                res.send({success: false, error: err});
            });
        }
    }).catch((err) => {
        return res.send({success: false, error: err});
    });
};

