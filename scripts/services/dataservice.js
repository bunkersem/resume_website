"use strict"
const pg = require('pg')
if (process.env.DEBUG == false)
    pg.defaults.ssl = true
const conString = process.env.DATABASE_URL
const userSelectFields = 'SELECT id, username, age, email, last_online, created, icon, first_name, infix_name, last_name'

const {hash_guid} = require('../../credentials')
const crypto = require('crypto')

// pg.connect(conString, (err, client, done) => {
//     if (err) return console.error('error fetching client from pool', err)
//     client.query('SELECT $1::varchar AS my_query;', ['Test Succeeded'], (err, result) => {
//         if (err) return console.error('error occured during query', err)
//         console.log(result.rows[0])
//     })
// })


module.exports = {
    users: require('./userdataservice'),
    sectors: require('./sectordataservice'),
    workPlaces: require('./workplacesdataservice'),
    documents: require('./documentdataservice')
}

