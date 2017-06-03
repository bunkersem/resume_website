require('dotenv').load();
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const session = require('express-session')
const pg = require('pg')
const pgSession = require('connect-pg-simple')(session)
const livereload = require('express-livereload')

// Routers
const index = require('./routes/index')
const users = require('./routes/users')
const documents = require('./routes/documents')
const sectors = require('./routes/sectors')
const workPlaces = require('./routes/workplaces')
const search = require('./routes/search')

const app = express();

const auth = require('./scripts/auth')
const credentials = require('./credentials')
const dataservice = require('./scripts/services/dataservice')

require('./scripts/core')

pg.defaults.ssl = true

console.log(require('./credentials'));

global.connectionString = process.env.DATABASE_URL;
console.log("DB URL: " + process.env.DATABASE_URL)

livereload(app, config={})

app.use(cookieParser(credentials.cookie_secret))
app.use(fileUpload())



app.use(session({
    store: new pgSession({
        tableName: 'user_sessions'
    }),
    resave: false,
    secret: credentials.cookie_secret,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/lib", express.static(path.join(__dirname, 'bower_components')))

app.use('/', index)
app.use('/users', users)
app.use('/documents', documents)
app.use('/workplaces', workPlaces)
app.use('/sectors', sectors)
app.use('/search', search)

app.use('/about', function(req, res, next){
    res.render('about', { title: 'About' , pageTitle: 'Welcome | About', data:{loggedin: isUser(req)}})
})

app.use('/contact', function(req, res, next){
    res.render('contact', { title: 'Contact' , pageTitle: 'Welcome | Contact', data:{loggedin: isUser(req)}})
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {data:{}});
});

module.exports = app;
