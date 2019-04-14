const {Pool} = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.ELEPHANT_DB
});

pool.on('connect', () => {
    console.log('Connect to the database');
});

//create table urls
pool.query(
    `CREATE TABLE IF NOT EXISTS
    domain (
        id SERIAL NOT NULL PRIMARY KEY,
        domain VARCHAR(100) NOT NULL,
        title CHAR(50) NOT NULL,
        icon_link VARCHAR(300),
        page_img VARCHAR(300),
        description VARCHAR(300),
        visit_count INTEGER,
        category CHAR(50),
        collection_id INTEGER REFERENCES collection(id)
    )`
).then((res) => {
    console.log('Create "urls" table successfully');
    console.log(res);
}).catch((err) => {
    console.log('Can not create "urls" table:\n', err);
});

//create table visit
pool.query(
    `CREATE TABLE IF NOT EXISTS
    visit(
        id SERIAL NOT NULL PRIMARY KEY,
        url VARCHAR(300) NOT NULL,
        startVisitAt DATE NOT NULL,
        endVisitAt DATE NOT NULL,
        duration TIME NOT NULL,
        uploadTraffic INTEGER,
        downloadTraffic INTEGER,
        domain_id INTEGER REFERENCES domain(id)
    )  `
).then((res) => {
    console.log('Create "visit" table successfully');
    console.log(res);
}).catch((err) => {
    console.log('Can not create "visit" table:\n', err);
});

//create collection table
pool.query(
    `CREATE TABLE IF NOT EXISTS
    collection(
        id SERIAL NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category CHAR(50)
    )`
).then((res) => {
    console.log('Create "collection" table successfully');
    console.log(res);
}).catch((err) => {
    console.log('Can not create "collection" table\n', err);
});

pool.end();
