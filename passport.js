var passport = require('passport');
var Saml = require('passport-saml').Strategy;
var config = require('./config.json')['dev'];

var users = [];

function findByEmail(email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.email === email) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user.email);
});

passport.deserializeUser(function(id, done) {
    findByEmail(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new Saml({
        issuer: config.samlconfig.issuer,
        path: '/login/callback',
        entryPoint: config.samlconfig.entryPoint,
        cert: config.samlconfig.cert
    },
    function(login, done) {
        if (!login.email) {
           return done(new Error("Check saml config"), null);
        }
        process.nextTick(function() {
            findByEmail(login.email, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    users.push(login);
                    return done(null, login);
                }
                return done(null, user);
            })
        });
    }
));

passport.protected = function protected(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    console.log(req.isAuthenticated());
    res.redirect('/login');
};

exports = module.exports = passport;