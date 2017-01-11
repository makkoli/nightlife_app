var Env = require('../env/env'),
    Yelp = require('yelp'),
    Location = require('../models/location-model'),
    User = require('../models/user-model'),
    Promise = require('promise');

// Retrieve a list of bars for the area requested
// res parameter passes in logged and user values if they are logged in
exports.getSearchInfo = function(req, res) {
    // Set last search if user is not logged so it returns the search
    // if the user logs in
    if (!res.locals.logged) {
        req.session.lastSearch = req.query.term;
    }
    else {
        req.session.lastSearch = "";
    }

    // Retrieve data to send back to client
    new Promise(function(resolve, reject) {
        // Get bars in the area with Yelp
        getYelpLocations(req.query.term, function(err, res) {
            if (err) reject(err);
            else resolve(res);
        });
    }).then(function(response) {
        return new Promise(function(resolve, reject) {
            // Retrieves the number of people going from the db
            getNumGoing(response, function(err, res) {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }).then(function(response) {
        return new Promise(function(resolve, reject) {
                // Retrieves the locations that the user is going to
                compareUserLocationsAndResults(response, res.locals.logged,
                    res.locals.user, function(err, res) {
                    if (err) reject(err);
                    else resolve(res);
                });
        });
    }).then(function(response) {
        // Render the page with the response data
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(response));
    }).catch(function(error) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(null);
    });
};

// Get 20 locations in the area using Yelp
function getYelpLocations(searchTerm, cb) {
    var yelp = new Yelp({
        consumer_key: Env.env.yelpConsumerKey,
        consumer_secret: Env.env.yelpConsumerSecret,
        token: Env.env.yelpToken,
        token_secret: Env.env.yelpTokenSecret
    });

    // Query to Yelp API
    yelp.search({
        term: 'bars',
        location: searchTerm,
        limit: 20,
        radius_filter: 10000
    })
    .then(function(data) {
        cb(null, data.businesses);
    })
    .catch(function(err) {
        cb(true, null);
    });
};

// Get the number of users that are going to the businesses in the area
function getNumGoing(businesses, cb) {
    var locations = [];

    // Get all the locations to search for db and set default going to 0
    businesses.forEach(function(item) {
        locations.push(item.id);
        item.going = 0;
    });

    var query = { "id": { "$in": locations } };

    Location.find(query, function(err, docs) {
        if (err) cb(true, null);

        // If people are going to bars in this location, calculate the num going
        if (docs.length > 0) {
            docs.forEach(function(currentDoc) {
                businesses.forEach(function(currentBusiness) {
                    // Check if anyone is going
                    if (currentBusiness.id === currentDoc.id) {
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

        cb(null, businesses);
    });
};

// Compares the user locations to the results and sets a flag if the user is
// going to a business
function compareUserLocationsAndResults(businesses, logged, user, cb) {
    // Add default of false
    businesses.forEach(function(business) {
        business.userGoing = false;
    });

    // If the user is not logged in, he's not going to any of the bars
    if (!logged) {
        cb(null, businesses);
    }
    // Else, we check to see if he is going to any of the bars
    else {
        var query = { "username": user };

        User.findOne(query, function(err, docs) {
            if (err) cb(true, null);

            docs.going_to.forEach(function(location) {
                businesses.forEach(function(business) {
                    // Set true if user is going and move to next location
                    if (location === business.id) {
                        business.userGoing = true;
                    }
                });
            });

            cb(null, businesses);
        });
    }
};
