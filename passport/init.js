const login = require('./login');
const signup = require('./signup');
const facebook = require('./facebook');
// var twitter = require('./twitter');
const User = require('../models/user');

module.exports = function (passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser((user, done) => {
        console.log('serializing user: '); console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            console.log('deserializing user:' + user.id);
            done(err, user);
        }).populate('livingCountry').populate('citizenship');
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
    facebook(passport);
    // twitter(passport);
};
