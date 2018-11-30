const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bCrypt = require('bcrypt-nodejs');
const uuidv1 = require('uuid/v1');
const emailController = require('../controllers/emailscontroller');

let signupParams = {
    passReqToCallback: true
};

let createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

let processSignupReturn = function (req, username, password, done) {
    const res = req.res;

    // Find a user in Mongo with provided username
    User.findOne({ email: req.param('email') }).then((user) => {

        let anonymous = req.param('anonymous') ? true : false;

        // Already exists
        if (user) {
            res.flash('error', 'User already exists with email: ' + req.param('email'));
            res.app.locals.responseInfo = { email: req.param('email'), username: username, anonymous: anonymous, password };
            return done(null, false);
        }

        // If there is no user with that email, create the user
        const newUser = new User();
        const token = uuidv1();

        // set the user's local credentials
        newUser.token = token;
        newUser.username = username;
        newUser.password = createHash(password);
        newUser.email = req.param('email');
        newUser.anonymous = anonymous;
        newUser.avatarUrl = req.param('avatarUrl');
        newUser.anonymous = req.param('anonymous');
        newUser.firstName = req.param('firstName');
        newUser.lastName = req.param('lastName');

        // Save the user
        return newUser.save();

    }).then((savedUser) => {

        console.log('User Registration successful');
        res.flash('success', 'Account created successfully');
        emailController.emailVerification(req, savedUser);
        return done(null, savedUser);

    }).catch((err) => {
        done(err);
    });

};

module.exports = function (passport) {
    passport.use('signup', new LocalStrategy(signupParams, processSignupReturn));
};
