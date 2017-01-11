var Location = require('../models/location-model'),
    User = require('../models/user-model'),
    Promise = require('promise');

// Index for the users destinations
exports.index = function(req, res) {
    if (res.locals.logged) {
        res.render('destinations', {
            logged: res.locals.logged,
            user: res.locals.user
        });
    }
    // Redirect to home page if not logged in
    else {
        res.redirect('/');
    }
}

// Get the users destinations
exports.getDestinations = function(req, res) {
    // Get the user from the current session
    var user = res.locals.user;

    // Retrieve the users destinations
    new Promise(function(resolve, reject) {
        // Get users destinations
        getDestinations(user, function(err, res) {
            if (err) reject(err);
            else resolve(res);
        });
    }).then(function(response) {
        // Get the names of the destinations
        return new Promise(function(resolve, reject) {
            getDestinationNames(response, function(err, res) {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }).then(function(response) {
        // Send the data back to the page
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(response));
    }).catch(function(error) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(null);
    })
};

// Delete a destination from the user's list
exports.deleteDestination = function(req, res) {
    var businessId = req.query.destId;
    //var query = { username: req.session.passport.user.username };
    var userQuery = { username: res.locals.user };
    var userUpdate = { "$pull":  { going_to: businessId } };
    var locationQuery = { id: businessId };
    var locationUpdate = { "$inc": { going: -1 } };

    User.findOneAndUpdate(userQuery, userUpdate, function(err) {
        if (err) console.log(err);
    });

    // Decrement number going from location records
    Location.findOneAndUpdate(locationQuery, locationUpdate, function(err) {
        if (err) console.log(err);
    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end();
};

// Retrieve the users destinations from the db
function getDestinations(user, cb) {
    var query = { "username": user };

    User.findOne(query, function(err, doc) {
        if (err) cb(true, null);

        cb(null, doc.going_to);
    });
};

// Get the destination names from the user's destinations(array)
function getDestinationNames(destinations, cb) {
    var query = { id: { "$in": destinations } };

    Location.find(query, function(err, docs) {
        if (err) cb(true, null);

        cb(null, docs.map(function(business) {
            return {
                id: business.id,
                name: business.name,
                going: business.going,
                url: business.url
            };
        }));
    });
};
