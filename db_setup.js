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
    //create collection table, add collection default
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    collection(
        id SERIAL NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );
        INSERT INTO collection(name) VALUES('default')`
    ).then((res) => {
        console.log('Create "collection" table successfully');
    }).catch((err) => {
        console.log('Can not create "collection" table\n', err);
    });

    //create domain_info table
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
        domain_info (
            id SERIAL NOT NULL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            title VARCHAR(100) NOT NULL,
            logo_link VARCHAR(500),
            img_link VARCHAR(500),
            description VARCHAR(500),
            publisher VARCHAR(300),
            visit_count INTEGER DEFAULT 0,
            duration INTERVAL DEFAULT '0 seconds',
            uploadTraffic INTEGER DEFAULT 0,
            downloadTraffic INTEGER DEFAULT 0
        )`
    )

    //create table urls
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    url_info (
        id SERIAL NOT NULL PRIMARY KEY,
        url VARCHAR(300) NOT NULL,
        title VARCHAR(100) NOT NULL,
        logo_link VARCHAR(500),
        img_link VARCHAR(500),
        description VARCHAR(500),
        publisher VARCHAR(300),
        collection_id INTEGER REFERENCES collection(id),
        domain_id INTEGER REFERENCES domain_info(id)
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
        url VARCHAR(500) NOT NULL,
        startVisitAt DATE NOT NULL,
        endVisitAt DATE NOT NULL,
        duration INTERVAL NOT NULL,
        uploadTraffic INTEGER,
        downloadTraffic INTEGER,
        url_id INTEGER REFERENCES url_info(id),
        domain_id INTEGER REFERENCES domain_info(id)
    )  `
    ).then((res) => {
        console.log('Create "visit" table successfully');
    }).catch((err) => {
        console.log('Can not create "visit" table:\n', err);
    });

    await pool.end();
})()


