var Location = require('../models/location-model'),
    User = require('../models/user-model');

// Adds a user to a bar they are going to
exports.add = function(req, res) {
    var barId = req.query.id;
    var barName = req.query.name;
    var barURL = req.query.url;

    // Add to user's list of bars they are going to
    User.update({ "username": res.locals.user },
                { "$addToSet": { "going_to": barId } }, function(err) {
                    console.log(err);
                });

    // Upsert the bar into locations and increase number of people going
    Location.update({ "id": barId, "name": barName, "url": barURL },
                    { "$inc": { "going": 1 } },
                    { upsert: true }, function(err) {
                        console.log(err);
                    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end();
};
