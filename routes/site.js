// Landing page
exports.index = function(req, res) {
    res.render('index', {
        logged: res.locals.logged,
        user: res.locals.user
    });
};

// Initialize the search page with user's last search if user just logged in
exports.initSearch = function(req, res) {
    var initData = {
        user: res.locals.user,
        lastSearch: req.session.lastSearch
    };

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify(initData));
};
