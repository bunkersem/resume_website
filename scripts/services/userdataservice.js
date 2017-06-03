"use strict"
const pg = require('pg')
if (process.env.DEBUG == false)
    pg.defaults.ssl = true
const conString = process.env.DATABASE_URL
const userSelectFields = 'SELECT id, username, birth, email, last_online, created, icon, first_name, infix_name, last_name'

const { hash_guid } = require('../../credentials')
const crypto = require('crypto')
require('../core')()
require('./transformeddocument')()


module.exports = {

    addUser: addUser,
    setUserIcon: setUserIcon,
    removeUser: removeUser,
    getUsers: getUsers,
    getUserByEmail: getUserByEmail,
    getUserByUsername: getUserByUsername,
    getUsersByAge: getUsersByAge,
    getUsersWhereAgeGreaterThen: getUsersWhereAgeGreaterThen,
    getUsersWhereAgeLessThen: getUsersWhereAgeLessThen,
    usersWithUserNameCount: usersWithUserNameCount,
    containsUserWithUserName: containsUserWithUserName,
    validateUser: validateUser,
    searchUser: searchUser
}

function searchUser(searchString){
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { reject('error fetching client from pool: ' + err) }
            //Query:
            searchString = '%' + searchString.toLowerCase() + '%'
            try {
                //documents
                client.query(
                    `SELECT id, owner_id, is_public, last_updated, created, content, title
                     FROM documents
                     WHERE lower(title) 
                     LIKE $1::varchar
                     LIMIT 14`, [searchString],
                    (err, result) => {
                        if (err) { 
                             done()
                             reject('error occured during query: ' + err)
                        }
                        //users
                        client.query(
                            `SELECT id, username, first_name, infix_name, last_name, created, last_online
                             FROM users
                             WHERE lower(concat(first_name,' ',infix_name,' ',last_name))
                             LIKE $1::varchar
                             LIMIT 6`, [searchString],
                            (err, result2) => {
                                done()
                                if (err) { reject('error occured during query: ' + err) }
                                resolve([
                                    result.rows.map(doc => new TransformedDocument(doc)), 
                                    result2.rows.map(user => new TransformedUser(user))
                                ])
                            })
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function addUser(user) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('INSERT INTO users (username, birth, email, first_name, infix_name, last_name, icon, password, last_online, created) VALUES'
                    + '($1::varchar, $2::integer, $3::varchar, $4::varchar, $5::varchar, $6::varchar, $7::text, $8::text, $9::integer, $10::integer);',
                    [user.username, user.birth, user.email, user.firstName, user.infixName, user.lastName, user.icon, passwordHash(user.password), user.lastOnline, user.created],
                    (err, result) => {
                        done()
                        if (err) reject('error occured during query: ' + err)
                        resolve(result)
                    })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function setUserIcon(username, base64encodedJpg) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('UPDATE users SET icon = $1::varchar WHERE username = $2::varchar;', [base64encodedJpg, username], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(true)

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function removeUser(userEmail) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query('DELETE FROM users WHERE email = $1::varchar;', [userEmail], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result)

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function getUsers() {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`${userSelectFields} FROM users;`, (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows.map(user => new TransformedUser(user)))

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err)}
            //Query:
            try {
                client.query(`${userSelectFields} FROM users WHERE email = $1::varchar;`, [email], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows ? new TransformedUser(result.rows[0]) : undefined)

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`${userSelectFields} FROM users WHERE username = $1::varchar;`, [username], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    console.log('result of the getUserByUsername call', result.rows[0])
                    resolve(result.rows[0] ? new TransformedUser(result.rows[0]) : undefined)

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function getUsersByAge(age) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            var newDate = new Date();
            newDate.setUTCFullYear(newDate.getUTCFullYear() - age, newDate.getUTCMonth(), newDate.getUTCDate());
            var ld = new Date(newDate)
            newDate.setUTCFullYear(newDate.getUTCFullYear() - 1, newDate.getUTCMonth(), newDate.getUTCDate());
            var sd = new Date(newDate)

            if (err) { done(); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`${userSelectFields} FROM users WHERE birth > $1::integer AND birth < $2::integer;`, [sd.getUnixTime(), ld.getUnixTime()], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows.map(user => new TransformedUser(user)))

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}


function getUsersWhereAgeGreaterThen(age) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            var newDate = new Date();
            newDate.setUTCFullYear(newDate.getUTCFullYear() - (age + 1), newDate.getUTCMonth(), newDate.getUTCDate());
            var ld = new Date(newDate)
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`${userSelectFields} FROM users WHERE birth > $1::integer;`, [ld.getUnixTime()], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows.map(user => new TransformedUser(user)))

                })

            } catch (err) { done(err); reject(err) }

        })
    })
}


function getUsersWhereAgeLessThen(age) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            var newDate = new Date();
            newDate.setUTCFullYear(newDate.getUTCFullYear() - (age), newDate.getUTCMonth(), newDate.getUTCDate());
            var ld = new Date(newDate)
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`${userSelectFields} FROM users WHERE birth < $1::integer;`, [ld.getUnixTime()], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows.map(user => new TransformedUser(user)))

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            username = '%' + username + '%'
            try {
                client.query(`${userSelectFields} FROM users WHERE username LIKE $1::varchar;`, [username], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    console.log(result.rows[0])
                    resolve(result.rows[0] ? new TransformedUser(result.rows[0]) : undefined)

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function usersWithUserNameCount(username) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`SELECT count(*) FROM users WHERE username = $1::varchar;`, [username], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows[0].count)

                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function containsUserWithUserName(username) {
    return new Promise((resolve, reject) => {
        usersWithUserNameCount(username).then(res => {
            console.log(res);
            resolve(res > 0)
        })
            .catch(err => {
                reject('error fetching client from pool: ' + err)
            })
    })
}

function validateUser(username, password) {
    return new Promise((resolve, reject) => {
        pg.connect(conString, (err, client, done) => {
            if (err) { done(err); reject('error fetching client from pool: ' + err) }
            //Query:
            try {
                client.query(`SELECT password FROM users WHERE username = $1::varchar;`, [username], (err, result) => {
                    done()
                    if (err) reject('error occured during query: ' + err)
                    resolve(result.rows && result.rows.length > 0 && passwordHash(password) === result.rows[0].password)
                })
            } catch (err) { done(err); reject(err) }

        })
    })
}

function passwordGen() {
    var hash = crypto.createHash('sha256');
    hash.update((new Date).getTime().toString() + hash_algorithm)
    var result = hash.digest('hex')
    return result.slice(0, 15);
}

function passwordHash(password) {
    var hash = crypto.createHash('sha256');
    hash.update(password)
    var result = hash.digest('hex')
    return result
}


function TransformedUser(dbUser) {
    if (!dbUser) return undefined;
    this.id = dbUser.id
    this.username = dbUser.username
    this.birth = dbUser.birth
    this.email = dbUser.email
    this.firstName = dbUser.first_name
    this.infixName = dbUser.infix_name
    this.lastName = dbUser.last_name
    this.icon = dbUser.icon
    this.lastOnline = dbUser.last_online
    this.created = dbUser.created
}