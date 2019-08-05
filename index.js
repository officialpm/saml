var express = require('express');
var connect = require('connect');
var auth = require('./passport');
var app = express();
var path = require('path');

app.configure(function() {
    app.use(express.logger());
    app.use(connect.compress());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: "TH15_15_@_MULTIVER5E_5@LT_KEY" }));
    app.use(auth.initialize());
    app.use(auth.session());
});

app.get('/', auth.protected, function(req, res) {
    res.json(req.user);
});

app.get('/home', auth.protected, function(req, res) { 
    res.json(req.user);
});

app.get('/login', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

app.post('/login/callback', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/home');
});

app.use(express.static(path.join(__dirname, 'public')));
var server = app.listen(process.env.PORT || 3000);
console.log("Server on  " + server);