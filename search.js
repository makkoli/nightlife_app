var Env = require('./env/env'),
    Yelp = require('yelp'),
    Location = require('./models/location-model');

// Retrieve a list of bars for the area requested
// res parameter passes in logged and user values if they are logged in
exports.getSearchInfo = function(req, res) {
    // Set last search
    req.session.lastSearch = req.query.term;

    // Retrieve data to send back to client
    var data = getYelpLocations(req.query.term, getNumGoing);
    // If the user is logged in, we need to see if he is going to any of the bars
    if (/*res.locals.logged*/false) {
        var userLocations = getUserLocations("makwrt");
        data = compareUserLocationsAndResults(data, userLocations, true/*res.locals.logged*/);
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify(data));
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
        // Get the number of people going to each business
        cb(data.businesses);
    })
    .catch(function(err) {
        console.error(err);
    });
};

// Get the number of users that are going to the businesses in the area
function getNumGoing(businesses) {
    var locations = [];

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

        return businesses;
    });
};

// Gets an array of all the location destinations for a user
function getUserLocations(user) {
    var query = { "username": user };

    User.findOne(query, function(err, docs) {
        if (err) res.render(500);

        return docs.going_to;
    });
};

// Compares the user locations to the results and sets a flag if the user is
// going to a business
function compareUserLocationsAndResults(businesses, userLocations, logged) {
    // If the user is not logged in, he's not going to any of the bars
    if (!logged) {
        businesses.forEach(function(business) {
            business.userGoing = false;
        });
    }
    // Else, we check to see if he is going to any of the bars
    else {
        userLocations.forEach(function(location) {
            businesses.forEach(function(business) {
                // Set true if user is going
                if (location === business.name) {
                    business.userGoing = true;
                }
                else {
                    business.userGoing = false;
                }
            });
        });
    }

    return businesses;
};
