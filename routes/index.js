var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Home' , pageTitle: 'Welcome | Home', data:{isHomePage: true, loggedin: isUser(req)}});
});

module.exports = router;
