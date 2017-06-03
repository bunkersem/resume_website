const express = require('express')
const router = express.Router()
const dataservice = require('../scripts/services/dataservice')
const {User} = require('../scripts/models')
const auth = require('../scripts/auth')
const credentials = require('../credentials')
require('../scripts/core')()
const models = require('../scripts/models')


/* GET users listing. */
// router.get('/', (req, res, next) => {
//     res.send('respond with a resource')
// })

router.get('/allpublicdocuments', (req, res, next) => {
    dataservice.documents.getAllPublicDocuments().then(result => {
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

router.get('/publicdocumentsbytitle', (req, res, next) => {
    var searchQuery = req.query.q;
    dataservice.documents.FindPublicDocumentsByTitle(searchQuery).then(result => {
        res.set("Connection", "close");
        res.json(result)
        res.end()
    })
    .catch((err) => {
        errorHandler(err); 
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})

router.get('/mydocumentbyid', auth, function(req, res, next) {
    var id = req.query.id
    dataservice.documents.getDocumentWithContentById(id).then(result => {
        if (!req.session || !req.session.user || !req.session.userDetails || result.id !== req.session.userDetails.id){
            console.error('User tried to acces a document but the where not able to verifty that they were the owner.')
            next();
        }
        res.set("Connection", "close");
        res.json(result)
        res.end()
    })
    .catch((err) => {
        errorHandler(err); 
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
});

router.get('/mydocuments', auth, function(req, res, next){
    var id = req.session.userDetails.id    
    dataservice.documents.GetDocumentsByOwnerId(id)
    .then(result => {
        res.set("Connection", "close");
        res.status(201)
        res.json(result)
        res.end()
        
    })
    .catch(err => {
        errorHandler(err)
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})
// Reqeuest should have a document object with one property which is the title
router.post('/adddocument', auth, function(req, res, next){
    var id = req.session.userDetails.id
    dataservice.documents.AddDocument(
        new models.Document (
            undefined,                      // will be set by the database
            req.body.document.title, 
            req.session.userDetails.id, 
            false, // Not public
            (new Date()).getUnixTime(),     // Created
            (new Date()).getUnixTime(),     // Last Updated
            {})                      // Contents text gets set to '{}' by the database upon entry, update this value later.
    ).then(result => {
        res.set("Connection", "close");
        res.sendStatus(201)
        res.end();
    })
    .catch(err => {
        errorHandler(err)
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})

router.post('/updatedocument', auth, function(req, res, next){
    var doc = req.body.document
    dataservice.documents.UpdateDocument(doc.id, doc)
    .then(result => {
        res.set("Connection", "close");
        res.sendStatus(201)
        res.end();
    })
    .catch(err => {
        errorHandler(err)
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})

router.post('/removedocument', auth, function(req, res, next){
    var id = req.body.document.id
    dataservice.documents.removeDocumentById(id)
    .then(result => {
        res.set("Connection", "close");
        res.sendStatus(201)
        res.end();
    })
    .catch(error => {
        errorHandler(error)
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})


/*
Document: function Document(id, title, ownerId, isPublic, last_updated, created, content){
        this.id = id;
        this.title = title;
        this.ownerId = ownerId;
        this.isPublic = isPublic;
        this.last_updated = last_updated;
        this.created = created;
        this.content = content;
    }
    */


module.exports = router;

function errorHandler(err){
    console.error('an internal error occured', err)
}