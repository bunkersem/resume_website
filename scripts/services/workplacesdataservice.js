"use strict"
const pg = require('pg')
pg.defaults.ssl = true
const conString = process.env.DATABASE_URL



module.exports = {
    getAllWorkPlaces:getAllWorkPlaces,
    getWorkPlaceById:getWorkPlaceById,
    FindWorkPlacesByName:FindWorkPlacesByName
}

function getAllWorkPlaces(){
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try{
            client.query('SELECT id, name, description, tel, sector_ids FROM work_places',[],
                (err, result) => {
                    done();
                if (err) reject('error occured during query: ' + err)
                resolve(result.rows)
            })
            }catch(err){done(err); reject(err)}
        })
    })
}

function getWorkPlaceById(id){
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try{
            client.query('SELECT id, name, description, tel, sector_ids FROM work_places WHERE id = $1::integer',[id],
                (err, result) => {
                    done();
                if (err) reject('error occured during query: ' + err)
                resolve(result.rows[0])
            })
            }catch(err){done(err); reject(err)}
        })
    })
}

function FindWorkPlacesByName(searchString){
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try{
            client.query('SELECT id, name, description, tel, sector_ids FROM work_places WHERE name LIKE %$1::varchar%',[searchString],
                (err, result) => {
                if (err) reject('error occured during query: ' + err)
                resolve(result.rows)
            })
            }catch(err){
                done(err); reject(err);
            }
        })
    })
}