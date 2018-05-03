const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bCrypt = require('bcrypt-nodejs');

let loginParams = {
  usernameField: 'email',
  passReqToCallback: true
};

let isValidPassword = function(user, password) {
  return bCrypt.compareSync(password, user.password);
};

let processLoginReturn = function(req, email, password, done) {

  User.findOne({email}).then((user) => {

    // Email does not exist, log the error and redirect back
    if (!user) {
      console.log(`User Not Found with email ${email}`);
      return done(null, false, req.flash('message', 'User Not Found.'));
    }

    // User exists but wrong password, log the error
    if (!isValidPassword(user, password)) {
      console.log('Invalid Password');
      return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
    }

    // User and password both match, return user from done method
    // which will be treated like success
    return done(null, user);
  }).catch((err) => {

    // In case of any error, return using the done method
    if (err) {return done(err);}

  });
};

module.exports = function(passport) {
  passport.use('login', new LocalStrategy(loginParams, processLoginReturn));
};
