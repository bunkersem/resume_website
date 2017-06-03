const express = require('express')
const router = express.Router()
const dataservice = require('../scripts/services/dataservice')
const {User} = require('../scripts/models')
const auth = require('../scripts/auth')
const credentials = require('../credentials')


/* GET users listing. */
// router.get('/', (req, res, next) => {
//     res.send('respond with a resource')
// })

router.get('/allworkplaces', (req, res, next) => {
    dataservice.workPlaces.getAllWorkPlaces().then(result => {
        res.json(result)
    })
    .catch((err) => {errorHandler(err); next()})
})

router.get('/workplacebyid', function(req, res, next) {
    var id = req.query.id
    dataservice.workPlaces.getWorkPlaceById(id).then(result => {
        // User was added succesfully
        res.set("Connection", "close");
        res.json(result)
        res.end();
    })
    .catch((err) => {errorHandler(err); next()})
});

router.get('/workplacesbyname', function(req, res, next) {
    var name = req.query.name
    dataservice.workPlaces.FindWorkPlacesByName(name).then(result => {
        // User was removed succesfully
        res.set("Connection", "close");
        res.json(result)
        res.end();
    })
    .catch((err) => {errorHandler(err); next()})
});


module.exports = router;

function errorHandler(err){
    console.error('an internal error occured', err)
}