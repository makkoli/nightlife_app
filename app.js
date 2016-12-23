var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    SearchForm = require('./search-form.js'),
    Yelp = require('yelp')
    app = express();

var dbConnStr = 'mongodb://localhost:27017/nightlife';
// Connect mongoose to db
mongoose.connect(dbConnStr, function(err) {
    if (err) throw err;
    console.log('Connected to mongodb');
});

// Length of cache for static files
var oneDay = 86400000;

// static files
app.use(express.static(__dirname + '/public', { maxAge: oneDay }));
// parse body for POST sent by user
app.use(bodyParser.urlencoded({ extended: true }));
// views
app.set("views", __dirname + "/views");
app.set("view engine", "pug");
// helmet for security
app.use(helmet());
// Parsing and session middleware
app.use(require('cookie-parser')());
app.use(require('express-session')({
    secret: 'Super Sekret Password',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: oneDay * 365    // year expiration
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user instance
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

/**************************** Get Page Requests *******************************/
// Retrieve the home page
app.get('/', function(req, res) {
    res.render('index');
});


/******************************************************************************/

/*************************** Post Page Requests *******************************/
// Retrieve a list of bars for the area requested
app.post('/', function(req, res) {
    var yelp = new Yelp({
        
    });

    // Query to Yelp API
    yelp.search({
        term: 'bars',
        location: req.body.searchTerm,
        limit: 20,
        radius_filter: 10000
    })
    .then(function(data) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(data));
    })
    .catch(function(err) {
        console.error(err);
    });
});

/******************************************************************************/

/*************************** Middleware ***************************************/


/******************************************************************************/

var server = app.listen(8000, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
});
