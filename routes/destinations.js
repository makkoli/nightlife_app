// Index for the users destinations
exports.index = function(req, res) {
    res.render('destinations', {
        logged: res.locals.logged,
        user: res.locals.user
    });
};
