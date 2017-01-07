// Gets login session for proper rendering
exports.getLoginSession = function(req, res, next) {
    res.locals.logged = req.session.passport == undefined ? false : true,
    res.locals.user = req.session.passport == undefined ? "" : req.session.passport.user.username

    next();
}

// Gets all the location destinations for a user
exports.getUserLocations = function (req, res, next) {
    // If the user is logged in, retrieve destinations
    //if (!!res.locals.user) {
        //var query = { "username": res.locals.user };
        var query = { "username": "makwrt" };

        User.findOne(query, function(err, docs) {
            if (err) res.render(500);

            res.locals.userLocations = docs.going_to;
            next();
        });
    //}
    // Else, just return the empty user string
    /*else {
        next();
    }*/
};
