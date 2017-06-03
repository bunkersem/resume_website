const express = require('express')
const router = express.Router()
const dataservice = require('../scripts/services/dataservice')
const {User} = require('../scripts/models')
const auth = require('../scripts/auth')
const credentials = require('../credentials')
const base64 = require('base-64')
const jimp = require('jimp')
const fs = require('fs')
require('../scripts/core')()


/* GET users listing. */
// router.get('/', (req, res, next) => {
//     res.send('respond with a resource')
// })

router.get('/allusers', (req, res, next) => {
    dataservice.users.getUsers().then(result => {
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

router.post('/createuser', function(req, res, next) {
    var {username,birth,email} = req.body
    var newUser = new User(username, birth, email)
    dataservice.users.addUser(newUser).then(result => {
        // User was added succesfully

        res.set("Connection", "close");
        res.sendStatus(201)
        res.end();
    })
    .catch((err) => {errorHandler(err); 
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
});

router.post('/removeuser', function(req, res, next) {
    var {email} = req.body
    dataservice.users.removeUser(email).then(result => {
        // User was removed succesfully

        res.set("Connection", "close");
        res.sendStatus(200)
        res.end();
        
    })
    .catch((err) => {errorHandler(err); 
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
});

router.get('/register', function(req, res, next){
    res.render('register', {data:{loggedin: isUser(req)}})
})

router.post('/register', function(req, res, next) {
    function registerError(err){
        errorHandler(err);
        res.sendStatus(500)
    }

    var {username, email, birth, firstName, infixName, lastName, password, icon} = req.body
    var newUser = new User(username, birth, email, firstName, infixName, lastName, password)

    dataservice.users.addUser(newUser).then(result => {
        // User was Registered succesfully

        res.render('afterregister', {
            pageTitle:"Welcome | Login", title:"Login", data:{ 
                message:'<b>Thanks For Registering</b> ' + username + ', to <b>Hapi.</b><br />We hope we can be of service.',
                messageType: 'success',
            }
        })
        if (!req.files || !req.files.icon)
            return;

        //Async Icon Task;
        console.log(req.files)
        jimp.read(req.files.icon.data, (err, image) => {
            image.resize(128, 128)            // resize 
            .quality(60)                 // set JPEG quality 
            .getBuffer(jimp.MIME_JPEG, (err, buffer) => {
                console.log('buffer is', buffer.buffer);
                var encoded = buffer.toString('hex')
                dataservice.users.setUserIcon(username, encoded)
                .then(result => {
                    console.log('suucesfuly set the icon for for user:', username)
                })
                .catch(error => {
                    console.error('something went wrong while setting the icon for username: '+ username + '\nThe Error: '+ error)
                })
            })
        })
    })
    .catch((err) => {registerError(err);})

})

router.post('/login', function(req, res, next) {
    function fail(message){
        res.render('login', {
            pageTitle:"Login Page",  title: 'Login',  message: message, messageType: 'danger',  data:{ loggedin: false} 
        })
    }

    var {username, password} = req.body;
    if (!username || !password)
        fail("<b>Login Failed</b> Please Try Again.")
    dataservice.users.validateUser(username, password).then(result => {
        if (result === true){
            
            dataservice.users.getUserByUsername(username)
                .then(result => {
                    req.session.user = username;
                    req.session.userDetails = result;
                    res.render('profile', {
                        pageTitle:"Welcome | Profile", 
                        title:"You have Logged in succesfully.",
                        data:{
                            loggedin:true,
                            user: req.session.userDetails
                        }
                    })
                })
                .catch(err => {
                    errorHandler(err)
                    fail("<b>Login Failed</b> Please Try Again.")
                })

            
        }
        else  {
            fail("<b>Login Failed</b> Please Try Again.")
        }
    }).catch(err => {
        errorHandler(err);
        fail("<b>Login Failed</b> Please Try Again.")
    })
})

router.get('/login', function(req, res, next){
    res.render('login', {title: 'Login', pageTitle: 'Login Page', data:{loggedin: isUser(req)}})
})

router.get('/logout', function(req, res, next){
    if (req.session && req.session.user){
        req.session.destroy();
        res.redirect('/')
    }else {
        res.render('error', {
            message: "Failed To Logout", 
            title: "Failed To Logout", 
            error: {},
            data:{
                loggedin:false, 
                message:"<b>Logout Failed</b><br /> You where possibly not logged in.",  
                messageType:"danger" 
            }
        })
    }
})

router.get('/icon/:username', function(req, res, next){
    console.log('trying to retrieve picture', req.params)
    var username = req.params.username
    dataservice.users.getUserByUsername(username)
    .then(result => {
        console.log("the query result is", result)
        if(!result.icon) return res.redirect(302, '/images/defaultavatar.jpg')
        //else
        var jpgImage
        try{
             jpgImage = Buffer.from(result.icon, 'hex')
             console.log(jpgImage)
        }catch(error){
            errorHandler("failed to decode image: ",error)
            return res.redirect(302, '/images/defaultavatar.jpg')
        }
        res.set("Connection", "close");
        res.contentType('jpeg')
        res.status(200)
        res.end(jpgImage)
    }).catch(err => {
        errorHandler(err)
        res.set("Connection", "close");
        res.sendStatus(500)
        res.end();
    })
})

router.post('/icon/updateicon', auth, function(req, res, next){
    //Async Icon Task;
    var username = req.session.user;
    console.log(req.files)
    jimp.read(req.files.icon.data, (err, image) => {
        image.resize(128, 128)            // resize 
        .quality(60)                 // set JPEG quality 
        .getBuffer(jimp.MIME_JPEG, (err, buffer) => {
            console.log('buffer is', buffer.buffer);
            var encoded = buffer.toString('hex')
            dataservice.users.setUserIcon(username, encoded)
            .then(result => {
                console.log('suucesfuly set the icon for for user:', username)
                res.set("Connection", "close");
                res.redirect('/users/profile')
                res.end();
            })
            .catch(error => {
                console.error('something went wrong while setting the icon for username: '+ username + '\nThe Error: '+ error)
                errorHandler(err)
                res.set("Connection", "close");
                res.sendStatus(500)
                res.end();
            })
        })
    })
})

router.use('/profile', require('./users.profile'))

module.exports = router;

function errorHandler(err){
    console.error('an internal error occured', err, err.trace)
}

