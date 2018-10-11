const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const settings = require('simplesettings');

let facebookStrategyParams = {
  clientID: settings.get('FCB_APP_ID'),
  clientSecret: settings.get('FCB_APP_SECRET'),
  callbackURL: settings.get('FCB_CB_URL')
};
// profileFields: ['id', 'name', 'picture.type(large)', 'emails', 'displayName', 'about', 'gender']

let processFacebookReturn = function(accessToken, refreshToken, profile, done) {

  // Asynchronous
  Promise.resolve().then(() => {

    // find the user in the database based on their facebook id
    return User.findOne({'fb.id': profile.id});

  }).then((user) => {

    // If there's a user, return immediately
    if (user) {
      return Promise.resolve(user);
    }

    // if there is no user found with that facebook id, create them
    let newUser = new User();

    // set all of the facebook information in our user model
    newUser.fb.id = profile.id; // set the users facebook id
    newUser.fb.access_token = accessToken; // we will save the token that facebook provides to the user

    // Facebook can return multiple emails so we'll take the first
    newUser.email = (typeof profile.emails !== 'undefined' && profile.emails instanceof Array) ? profile.emails[0].value : '';
    newUser.firstName = profile.name.givenName;
    newUser.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
    newUser.username = displayName;
    // newUser.gender = profile.gender;
    newUser.useFacebookPic = true;

    // save our user to the database
    return newUser.save();

  }).then((savedUser) => {

    return done(null, savedUser);

  }).catch((err) => {
    return done(err);
  });

};

module.exports = function(passport) {
  passport.use('facebook', new FacebookStrategy(facebookStrategyParams, processFacebookReturn));
};
