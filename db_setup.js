const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.LOCAL_DB
});

pool.on('connect', () => {
    console.log('Connect to the database');
});

(async () => {
    //create collection table
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    collection(
        id SERIAL NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category CHAR(50)
    )`
    ).then((res) => {
        console.log('Create "collection" table successfully');
    }).catch((err) => {
        console.log('Can not create "collection" table\n', err);
    });

    //create table urls
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    url_info (
        id SERIAL NOT NULL PRIMARY KEY,
        domain VARCHAR(100) NOT NULL,
        url VARCHAR(300) NOT NULL,
        title VARCHAR(50) NOT NULL,
        logo_link VARCHAR(300),
        img_link VARCHAR(300),
        description VARCHAR(300),
        publisher VARCHAR(100),
        visit_count INTEGER,
        category VARCHAR(50),
        collection_id INTEGER REFERENCES collection(id)
    )`
    ).then((res) => {
        console.log('Create "url_info" table successfully');
    }).catch((err) => {
        console.log('Can not create "url_info" table:\n', err);
    });

    //create table visit
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    visit(
        id SERIAL NOT NULL PRIMARY KEY,
        url VARCHAR(300) NOT NULL,
        startVisitAt DATE NOT NULL,
        endVisitAt DATE NOT NULL,
        duration TIME NOT NULL,
        uploadTraffic INTEGER,
        downloadTraffic INTEGER,
        url_id INTEGER REFERENCES url_info(id)
    )  `
    ).then((res) => {
        console.log('Create "visit" table successfully');
    }).catch((err) => {
        console.log('Can not create "visit" table:\n', err);
    });

    await pool.end();
})()


