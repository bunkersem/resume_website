const express = require('express')
const router = express.Router()
const dataservice = require('../scripts/services/dataservice')
const {User} = require('../scripts/models')
const auth = require('../scripts/auth')
const credentials = require('../credentials')
require('../scripts/core')()

router.get('/', auth, function(req, res, next){
    res.render('profile', {
        pageTitle: "Profile", 
        title: "We are rendering your profile right now", 
        data:{
            user:req.session.userDetails, 
            loggedin: isUser(req)
        }
    })
})

// router.get('/documents', auth, function(req, res, next){
//     res.render('documents', {
//         pageTitle: "Documents", 
//         title: "We are rendering your documents right now", 
//         data:{
//             user:req.session.userDetails, 
//             loggedin: isUser(req)
//         }
//     })
// })

module.exports = router;