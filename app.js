var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    mongoose = require('mongoose'),
    User = require('./models/user-model'),
    Location = require('./models/location-model'),
    Env = require('./env/env'),
    Yelp = require('yelp'),
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

/**************************** Get Page Requests *******************************/
// Retrieve the home page
app.get('/', getLoginSession, function(req, res) {
    console.log(req.session);
    res.render('index', {
        logged: res.locals.logged,
        user: res.locals.user
    });
});

app.get('/get_user_info', [getLoginSession, getUserLocations], function(req, res) {
    var data = {
        "user": res.locals.user,
        "userLocations": res.locals.userLocations
    };

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify(data));
});

// Login with twitter
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter redirects user here after approval
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/',
                                        failureRedirect: '/' }));


/******************************************************************************/

/*************************** Post Page Requests *******************************/
// Retrieve a list of bars for the area requested
app.post('/search', [getYelpLocations, getNumGoing], function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify(res.locals.businesses));
});

/******************************************************************************/

/*************************** Middleware ***************************************/

// Gets login session for proper rendering
function getLoginSession(req, res, next) {
    res.locals.logged = req.session.passport == undefined ? false : true,
    res.locals.user = req.session.passport == undefined ? "" : req.session.passport.user.username

    next();
};

// Get 20 locations in the area using Yelp
function getYelpLocations(req, res, next) {
    // Set last search
    req.session.lastSearch = req.query.term;

    var yelp = new Yelp({
        consumer_key: Env.env.yelpConsumerKey,
        consumer_secret: Env.env.yelpConsumerSecret,
        token: Env.env.yelpToken,
        token_secret: Env.env.yelpTokenSecret
    });

    // Query to Yelp API
    yelp.search({
        term: 'bars',
        location: req.query.term,
        limit: 20,
        radius_filter: 10000
    })
    .then(function(data) {
        res.locals.yelpData = data.businesses;

        next();
    })
    .catch(function(err) {
        console.error(err);
    });
};

// Get the number of users that are going to the businesses in the area
function getNumGoing(req, res, next) {
    var locations = [];
    businesses = res.locals.yelpData;

    // Get all the locations to search for db
    businesses.forEach(function(item) {
        locations.push(item.id);
    });

    var query = { "id": { "$in": locations } };

    Location.find(query, function(err, docs) {
        if (err) res.render(500);

        // If people are going to bars in this location, calculate the num going
        if (docs.length > 0) {
            docs.forEach(function(currentDoc) {
                businesses.forEach(function(currentBusiness) {
                    // Set default going to 0
                    currentBusiness.going = 0;

                    // Check if anyone is going
                    if (currentBusiness.id == currentDoc.id) {
                        currentBusiness.going = currentDoc.going;
                    }
                });
            });
        }
        // Else, no one is going to bars in this location
        else {
            businesses.forEach(function(currentBusiness) {
                currentBusiness.going = 0;
            });
        }

        // Move on to render the page
        res.locals.businesses = businesses;
        next();
    });
};

// Gets all the location destinations for a user
function getUserLocations(req, res, next) {
    // If the user is logged in, retrieve destinations
    if (!!res.locals.user) {
        var query = { "username": res.locals.user };

        User.findOne(query, function(err, docs) {
            if (err) res.render(500);

            res.locals.userLocations = docs.going_to;
            next();
        });
    }
    // Else, just return the empty user string
    else {
        next();
    }
};

/******************************************************************************/

var server = app.listen(8000, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
});
