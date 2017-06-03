"use strict"
const pg = require('pg')
pg.defaults.ssl = true
const conString = process.env.DATABASE_URL
require('../core')
require('./transformeddocument')



module.exports = {
    getAllDocuments: getAllDocuments,
    getAllPublicDocuments: getAllPublicDocuments,
    getDocumentWithContentById: getDocumentWithContentById,
    FindDocumentsByTitle: FindDocumentsByTitle,
    GetDocumentsByOwnerId: GetDocumentsByOwnerId,
    AddDocument: AddDocument,
    UpdateDocument: UpdateDocument,
    FindPublicDocumentsByTitle: FindPublicDocumentsByTitle,
    removeDocumentById: removeDocumentById

}

/*

this.title = title;
this.ownerId = ownerId;
this.isPublic = isPublic;
this.last_updated = last_updated;
this.created = created;

        */

function getAllDocuments() {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (error, client, done) => {
            if (error) done(); reject('error fetching client from pool: ' + error)
            //Query:
            try {
                client.query('SELECT id, owner_id, title, is_public, last_updated, created FROM documents;', [],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows.map(doc => new TransformedDocument(doc)))
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function getAllPublicDocuments() {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (error, client, done) => {
            if (error) done(err); reject('error fetching client from pool: ' + error)
            //Query:
            try {
                client.query('SELECT id, owner_id, title, is_public, last_updated, created FROM documents WHERE is_public = true;', [],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows.map(doc => new TransformedDocument(doc)))
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}
function getDocumentWithContentById(id) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) done(err); reject('error fetching client from pool: ' + err)
            //Query:
            try {
                client.query('SELECT id, owner_id, title, is_public, last_updated, created, content FROM documents WHERE id = $1::integer;', [id],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(new TransformedDocument(result.rows[0]))
                    })
            }
            catch (err) { done(err); reject(err) }

        })
    })
}

function FindDocumentsByTitle(searchString) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) done(err); reject('error fetching client from pool: ' + err)
            //Query:
            searchString = '%' + searchString + '%'
            try {
                client.query('SELECT id, owner_id, title, is_public, last_updated, created FROM documents WHERE title LIKE $1::varchar;', [searchString],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows.map(doc => new TransformedDocument(doc)))
                    })
            } catch (err) { done(err); reject(err) }
        })
    })
}

function FindPublicDocumentsByTitle(searchString) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) done(err); reject('error fetching client from pool: ' + err)
            //Query:
            searchString = '%' + searchString + '%'
            try {
                client.query('SELECT id, owner_id, title, is_public, last_updated, created FROM documents WHERE title LIKE $1::varchar AND is_public = true;',
                    [searchString],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        if (!result) return []
                        resolveresult.rows.map(doc => new TransformedDocument(doc))
                    })
            } catch (err) { done(err); reject(err) }
        })
    })
}

function GetDocumentsByOwnerId(id) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err){ done(err); reject('error fetching client from pool: ' + err);}
            //Query:
            try {
                client.query('SELECT id, owner_id, title, is_public, last_updated, created, content FROM documents WHERE owner_id = $1::integer;', [id],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result.rows.map(doc => new TransformedDocument(doc)))
                    })
            } catch (err) {
                done(err)
                reject(err)
            }
        })
    })
}

function AddDocument(doc) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('INSERT INTO documents (owner_id, is_public, last_updated, created, title, content) '
                    + "VALUES ($1::integer, $2::boolean, $3::integer, $4::integer, $5::varchar, '{}')"
                    , [doc.ownerId, doc.isPublic, doc.lastUpdated, doc.created, doc.title], // Last value is the json content
                    // Which is hardcoded to be '{}' at creation
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result)
                    })
            } catch (err) { done(err); reject(err) }
        })
    })
}

/**
 * Updates Updateable fields of the document. Which Are: 
 *      - content
 *      - isPublic
 *      - title
 */
function UpdateDocument(id, doc) {
    //if (typeof doc.content !== 'string') doc.content = JSON.stringify(doc.content)
    return new Promise((resolve, reject) => {
        if (doc.content === null || doc.content === undefined
            || doc.isPublic === null || doc.isPublic === undefined
            || doc.title === null || doc.title === undefined
        ) {
            reject("Cannot update A Document in the database with values that are of type 'null' or 'undefined'")
        }
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('UPDATE documents SET title = $2::varchar, content = cast($3::json as json), is_public = cast($4::boolean as boolean)  WHERE id = $1::integer;'
                    , [id, doc.title, doc.content, doc.isPublic],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result)
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function removeDocumentById(id) {
    return new Promise((resolve, reject) => {
        if (id === undefined || id === null) {
            reject("Cannot Remove Document By Id if the id is 'null' or 'undeined'")
        }
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            client.query('DELETE FROM documents WHERE id = $1::integer', [id],
                (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result)
                })
        })
    })
}

