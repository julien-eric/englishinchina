const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bCrypt = require('bcrypt-nodejs');
const uuidv1 = require('uuid/v1');

let signupParams = {
  passReqToCallback: true
};

let createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

let processSignupReturn = function(req, username, password, done) {

  // Find a user in Mongo with provided username
  User.findOne({email: req.param('email')}).then((user) => {

    // Already exists
    if (user) {
      let message = 'User already exists with email: ' + req.param('email');
      // return Promise.resolve(new Error(message));
      return done(null, false, req.flash('signupMessage', message));
    }

    // If there is no user with that email, create the user
    const newUser = new User();
    const token = uuidv1();


    // set the user's local credentials
    newUser.token = token;
    newUser.username = username;
    newUser.password = createHash(password);
    newUser.email = req.param('email');
    newUser.anonymous = req.param('anonymous');
    newUser.avatarUrl = req.param('avatarUrl');
    newUser.firstName = req.param('firstName');
    newUser.lastName = req.param('lastName');

    // Save the user
    return newUser.save();

  }).then((savedUser) => {

    console.log('User Registration successful');
    return done(null, savedUser);

  }).catch((err) => {
    done(err);
  });

};

module.exports = function(passport) {
  passport.use('signup', new LocalStrategy(signupParams, processSignupReturn));
};
