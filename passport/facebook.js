const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const fbConfig = require('../fb.js');

module.exports = function(passport) {
  passport.use('facebook', new FacebookStrategy(
    {
      clientID: fbConfig.appID,
      clientSecret: fbConfig.appSecret,
      callbackURL: fbConfig.callbackUrl,
      profileFields: ['id', 'name', 'picture.type(large)', 'emails', 'displayName', 'about', 'gender'],
    },

    // facebook will send back the tokens and profile
    ((accessToken, refreshToken, profile, done) => {
      console.log('profile', profile);

      // asynchronous
      process.nextTick(() => {
        // find the user in the database based on their facebook id
        User.findOne({'fb.id': profile.id}, (err, user) => {
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err) {
            return done(err);
          }

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          }
          // if there is no user found with that facebook id, create them
          const newUser = new User();

          console.log('profile', profile);
          // set all of the facebook information in our user model
          newUser.fb.id = profile.id; // set the users facebook id
          newUser.fb.access_token = accessToken; // we will save the token that facebook provides to the user

          newUser.fb.firstName = profile.name.givenName;
          newUser.firstName = profile.name.givenName;

          newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
          newUser.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned

          // Facebook can return multiple emails so we'll take the first
          newUser.fb.email = (typeof profile.emails !== 'undefined' && profile.emails instanceof Array) ? profile.emails[0].value : '';
          newUser.email = (typeof profile.emails !== 'undefined' && profile.emails instanceof Array) ? profile.emails[0].value : '';

          newUser.avatarUrl = profile.photos[0].value;
          newUser.useFacebookPic = true;
          newUser.gender = profile.gender;

          // save our user to the database
          newUser.save((err) => {
            if (err) {
              throw err;
            }

            // if successful, return the new user
            return done(null, newUser);
          });
        });
      });
    }),
  ));
};
