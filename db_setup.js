const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

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
            name VARCHAR(100) NOT NULL UNIQUE,
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
    ).then(() => {
        console.log('Create "domain_info" table successfully');
    }).catch((err) => {
        console.log('Can not create "domain_info" table:\n', err);
    });

    //create table urls
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    url_info (
        id SERIAL NOT NULL PRIMARY KEY,
        url VARCHAR(300) NOT NULL UNIQUE,
        title VARCHAR(100) NOT NULL,
        logo_link VARCHAR(500),
        img_link VARCHAR(500),
        description VARCHAR(500),
        publisher VARCHAR(300)
    )`
    ).then((res) => {
        console.log('Create "url_info" table successfully');
    }).catch((err) => {
        console.log('Can not create "url_info" table:\n', err);
    });

    //create table visit
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    url(
        id SERIAL NOT NULL PRIMARY KEY,
        name VARCHAR(300) NOT NULL UNIQUE,
        collection_id INTEGER REFERENCES collection(id)
    )  `
    ).then((res) => {
        console.log('Create "url" table successfully');
    }).catch((err) => {
        console.log('Can not create "url" table:\n', err);
    });

    //create daily_domain
    await pool.query(
        `CREATE TABLE IF NOT EXISTS
    daily_domain(
        id SERIAL NOT NULL PRIMARY KEY,
        name VARCHAR(300) NOT NULL,
        date DATE NOT NULL,
        visitCount INTEGER NOT NULL,
        duration INTERVAL NOT NULL,
        uploadTraffic INTEGER,
        downloadTraffic INTEGER
    )`
    ).then((res) => {
        console.log('Create "daily_domain" table successfully');
    }).catch((err) => {
        console.log('Can not create "daily_domain" table:\n', err);
    });

    await pool.end();
})()
