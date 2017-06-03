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

router.get('/allsectors', (req, res, next) => {
    dataservice.sectors.getAllSectors().then(result => {
        res.set("Connection", "close");
        res.json(result)
        res.end();
    })
    .catch((err) => {
        errorHandler(err); 
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})

router.get('/sectorbyid', function(req, res, next) {
    var id = req.query.id
    dataservice.sectors.getSectorById(id).then(result => {
        // User was added succesfully
        res.set("Connection", "close");
        res.json(result)
        res.end();
    })
    .catch((err) => {
        errorHandler(err);
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
});

router.get('/sectorsbyname', function(req, res, next) {
    var name = req.query.name
    dataservice.sectors.findSectorsByName(name).then(result => {
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