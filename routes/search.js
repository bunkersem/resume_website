const express = require('express')
const router = express.Router()
const dataservice = require('../scripts/services/dataservice')
const { User } = require('../scripts/models')
const auth = require('../scripts/auth')
//const credentials = require('../credentials')
const base64 = require('base-64')
//const jimp = require('jimp')
//const fs = require('fs')
require('../scripts/core')()

router.get('/', auth, function (req, res, next) {
    res.render('search', { title: 'Search', pageTitle: 'Welcome | Search', data: { loggedin: isUser(req) } })
})

router.post('/', /*auth,*/ function (req, res, next) {
    var searchType = req.body.searchType
    var searchString = req.body.searchString

    search(searchString).then((result, rej) => {
        res.set("Connection", "close")
        res.json(result)
        res.end()
    }).catch(err => {
        errorHandler(err);
        res.set("Connection", "close")
        res.sendStatus(500)
        res.end()
    })
})


module.exports = router;

function search(searchString) {
    return new Promise((res, rej) => {
        dataservice.users.searchUser(searchString)
            .then(result => {
                console.log(result);
                return res(result)
            })
            .catch(err => {
                console.error(err)
                return rej(err)
            })
    })


}



function errorHandler(err) {
    console.error('an internal error occured', err, err.trace)
}
