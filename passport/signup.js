const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bCrypt = require('bcrypt-nodejs');

let signupParams = {
  passReqToCallback: true // allows us to pass back the entire request to the callback
};

let createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

let processSignupReturn = function(req, username, password, done) {

  // Find a user in Mongo with provided username
  User.findOne({username}).then((user) => {

    // Already exists
    if (user) {
      console.log(`User already exists with username: ${username}`);
      return done(null, false, req.flash('message', 'User Already Exists'));
    }

    // If there is no user with that email, create the user
    const newUser = new User();

    // set the user's local credentials
    newUser.username = username;
    newUser.password = createHash(password);
    newUser.email = req.param('email');
    newUser.avatarUrl = req.param('avatarUrl');
    newUser.firstName = req.param('firstName');
    newUser.lastName = req.param('lastName');

    // Save the user
    return newUser.save();

  }).then((savedUser) => {

    console.log('User Registration succesful');
    return done(null, savedUser);

  }).catch((err) => {
    done(err);
  });

};

module.exports = function(passport) {
  passport.use('signup', new LocalStrategy(signupParams, processSignupReturn));
};
