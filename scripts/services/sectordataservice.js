"use strict"
const pg = require('pg')
pg.defaults.ssl = true
const conString = process.env.DATABASE_URL



module.exports = {
    getAllSectors: getAllSectors,
    getSectorById: getSectorById,
    findSectorsByName: findSectorsByName
}

function getAllSectors() {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('SELECT id, name, description FROM sectors', [],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows)
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function getSectorById(id) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('SELECT id, name, description FROM sectors WHERE id = $1::integer', [id],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows[0])
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function findSectorsByName(searchString) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('SELECT id, name, description FROM sectors WHERE name LIKE %$1::varchar%', [searchString],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows)
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}