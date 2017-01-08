var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    mongoose = require('mongoose'),
    User = require('./models/user-model'),
    Env = require('./env/env'),
    site = require('./routes/site'),
    search = require('./routes/search'),
    destinations = require('./routes/destinations'),
    addUser = require('./routes/add_user'),
    middleware = require('./middleware'),
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
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: oneDay
    }
}));

passport.use(new TwitterStrategy({
    consumerKey: Env.env.twitterConsumerKey,
    consumerSecret: Env.env.twitterConsumerSecret,
    callbackURL: "http://localhost:8000/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        User.findOrCreate({ twitterId: profile.id, username: profile.username }, function(err, user) {
            if (err) { return done(err) };
            done(null, user);
        });
    }
));

// Configure passport authenticated session persistence
passport.serializeUser(function(user, cb) {
    cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

// Initialize passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());


// Home page
app.get('/', middleware.getLoginSession, site.index);

// Users destinations
app.get('/:user/destinations', middleware.getLoginSession, destinations.index);

// Login with twitter
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter redirects user here after approval
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/',
                                        failureRedirect: '/' }));

// Perform a search for bars
app.post('/search', middleware.getLoginSession, search.getSearchInfo);

// Add a user to a location
app.post('/add_user', middleware.getLoginSession, addUser.add);


var server = app.listen(8000, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
});
