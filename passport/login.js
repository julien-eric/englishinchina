const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bCrypt = require('bcrypt-nodejs');
const winston = require('../config/winstonconfig');

let loginParams = {
    usernameField: 'email',
    passReqToCallback: true
};

let isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
};

let processLoginReturn = function (req, email, password, done) {
    const res = req.res;

    User.findOne({ email }).then((user) => {

        // Email does not exist, log the error and redirect back
        if (!user) {
            winston.debug(`User Not Found with email ${email}`);
            res.flash('error', 'User not found with email ' + req.param('email'));
            res.app.locals.responseInfo = { email: req.param('email'), password };
            return done(null, false);
        }

        // User exists but wrong password, log the error
        if (!isValidPassword(user, password)) {
            winston.debug('Invalid Password');
            res.flash('error', 'Invalid Password');
            res.app.locals.responseInfo = { email: req.param('email') };
            return done(null, false); // redirect back to login page
        }

        // User and password both match, return user from done method
        // which will be treated like success
        return done(null, user);
    }).catch((err) => {

        // In case of any error, return using the done method
        if (err) {
            return done(err);
        }

    });
};

module.exports = function (passport) {
    passport.use('login', new LocalStrategy(loginParams, processLoginReturn));
};
