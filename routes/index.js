const express = require('express');
const router = express.Router();
const schools = require('../controllers/schools');
const email = require('../controllers/email');
const moment = require('moment');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const provincesController = require('../controllers/provinces');
const companiesController = require('../controllers/companies');
const citiesController = require('../controllers/cities');
const usersController = require('../controllers/users');
const crypto = require('crypto');
const scripts = require('../public/scripts');
const bCrypt = require('bcrypt-nodejs');
const utils = require('../utils');
// const jade = require('jade');

// let handleRenderError = (err, html) => {
//   if (err) {
//     console.log(err);
//   } else {
//     res.send({html});
//   }
// };

module.exports = function(passport) {

  // Home Page
  router.get('/', async (req, res) => {

    try {
      const pageSize = 6;
      let schoolList = await schools.getSchools(pageSize, 0, res.locals.admin);
      let provinces = await provincesController.getAllProvinces();
      let featuredSchools = await schools.featuredSchools();
      let popularCities = await citiesController.getMostPopularCities();
      let popularProvinces = await provincesController.getMostPopularProvinces();
      // let popularCompanies = await companiesController.getAllCompanies();
      let popularCompanies = await companiesController.countSchoolsPerCompany();

      const splashText = require('../splash-text.json');
      // let result = jadefunctions.returnAverage(popularCompanies[0].schools, 'averageRating');
      const truckSchoolList = jadefunctions.trunkContentArray(schoolList, 'description', 150);
      popularCompanies = jadefunctions.trunkContentArray(popularCompanies, 'description', 180);
      res.render('home/home', {
        title: 'Second Language World',
        main: true,
        featuredSchoolList: featuredSchools,
        schools: truckSchoolList,
        user: req.user,
        provinces,
        pictureInfo: pictureinfo,
        jadefunctions,
        popularCities,
        popularProvinces,
        popularCompanies,
        splashText,
        currentPage: 1,
        total: schoolList.count,
        totalPages: ((schoolList.count - (schoolList.count % pageSize)) / pageSize) + 1,
        scripts: [scripts.librater, scripts.util, scripts.rating, scripts.typeahead, scripts.typeaheadwrapper]
      });
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });


  router.get('/page/:page', async (req, res) => {

    let provinces = await provincesController.getAllProvinces();
    let popularCities = await citiesController.getMostPopularCities();
    let popularProvinces = await provincesController.getMostPopularProvinces();

    const page = req.params.page;
    const pageSize = 5;

    let schoolList = await schools.getSchools(pageSize, page - 1, admin);
    // const truckSchoolList = jadefunctions.trunkContentArray(schoolList, 'description', 150);
    res.render('home/home', {
      title: `Second Language World - Page ${page}`,
      schools: trunkSchoolList,
      user: req.user,
      provinces,
      pictureInfo: pictureinfo,
      jadefunctions,
      popularCities,
      popularProvinces,
      currentPage: page,
      total: schoolList.count,
      totalPages: ((schoolList.count - (schoolList.count % pageSize)) / pageSize) + 1,
      scripts: [scripts.librater, scripts.util, scripts.rating]
    });
  });

  /** **********************************************************************************************************
     *LOGIN :   GET : Root Path, login page.
     *          POST: Send user login request. redirect to home if sucessful, try again if failure
     ************************************************************************************************************ */
  router.route('/login')
    .get((req, res) => {
      // Display the Login page with any flash message, if any
      res.render('login/login', {
        title: 'Login - Second Language World',
        hideHeader: true,
        message: req.flash('message'),
        scripts: [scripts.util]
      });
    })
    .post((req, res, next) => {
      // custom callback allows us to redirect user to the same page he was on... (maybe better way?)
      let redirect = '/';
      if (req.body.redirecturl) {
        redirect = req.body.redirecturl;
      }
      passport.authenticate('login', (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.redirect('/login');
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.redirect(redirect);
        });
      })(req, res, next);
    });

  router.get('/loginajax', (req, res) => {
    res.render(
      'login/loginpanel', {
        title: 'Login - Second Language World',
        message: req.flash('message'),
        redirecturl: req.query.url,
        scripts: [scripts.util]
      },
      (err, html) => {
        if (err) {
          console.log(err);
        } else {
          res.send({html});
        }
      },
    );
  });

  /** **********************************************************************************************************
     *FACEBOOK LOGIN :   Facebook login will hit callback function below (login/facebook/callback)
     ************************************************************************************************************ */
  router.get(
    '/login/facebook',
    passport.authenticate('facebook', {scope: 'email'}),
  );


  /** **********************************************************************************************************
     *FACEBOOK LOGIN CALLBACK :   // handle the callback after facebook has authenticated the user
     ************************************************************************************************************ */
  router.get(
    '/login/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/'
    }),
  );


  /** **********************************************************************************************************
     *SIGNUP :   GET : Sign up page.
     *          POST: Send user registration request. redirect to home if sucessful, try again if failure
     ************************************************************************************************************ */
  router.route('/signup')
    .get((req, res) => {
      res.render('login/register', {
        title: 'Sign up - Second Language World',
        hideHeader: true,
        message: req.flash('signupMessage'),
        scripts: [scripts.util]
      });
    })
    .post(passport.authenticate('signup', {
      successRedirect: '/',
      failureRedirect: '/signup',
      failureFlash: true
    }));


  /** **********************************************************************************************************
     *SIGNOUT :   GET : Sign out and redirect to Home Page
     ************************************************************************************************************ */
  router.get('/signout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


  /** **********************************************************************************************************
     *FORGOT :   GET : Forgot your password page
     ************************************************************************************************************ */
  router.get('/forgot', (req, res) => {
    res.render('forgot', {
      title: 'Forgot your Password - Second Language World',
      user: req.user,
      pictureInfo: pictureinfo,
      scripts: [scripts.util]
    });
  });

  router.post('/forgot', async (req, res, next) => {

    const buffer = crypto.randomBytes(20);
    const token = buffer.toString('hex');

    let user = await usersController.findUserByEmail(req.body.email);
    if (!user) {
      req.flash('error', 'No account with that email address exists.');
      return res.redirect('/forgot');
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    await email.resetPassword(req, user, token, req);
    req.flash('info', 'An email has been sent to reset your password.');
    return res.redirect('/forgot');

  });

  router.get('/reset/:token', async (req, res) => {
    let user = await usersController.findUserByToken(req.params.token, {$gt: Date.now()});
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      title: 'Reset Password - Second Language World',
      pictureInfo: pictureinfo,
      scripts: [scripts.util]
    });
  });

  router.post('/reset/:token', async (req, res) => {
    let user = await usersController.findUserByToken(req.params.token, {$gt: Date.now()});
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('back');
    }

    // Generate hash using bCrypt
    const createHash = function(password) {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
    user.password = createHash(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    req.login(user, (err) => res.redirect('/'));
  });

  router.post('/contactus', (req, res) => {
    const message = `Email: ${req.body.email}\n${req.body.content}`;
    const callbackMessage = 'Thank you, we will get back to you shortly';
    email.sendEmail('julieneric11@gmail.com',
      'contactusfeedback@englishinchina.com',
      'Feedback comment from user',
      message,
      callbackMessage,
      req
    );
    res.redirect('/');
  });

  /** **********************************************************************************************************
     *USER :   GET : If user is authenticated, send him to view myprofile page, else redirect to login
     * This method is not the general one to view a different user.
     ************************************************************************************************************ */
  router.get('/user', utils.isAuthenticated, async (req, res) => {
    let reviews = await reviews.findReviewsByUser(req.user._id);
    res.render('user', {
      title: `User ${req.user.username} - Second Language World`,
      user: req.user,
      reviews,
      pictureInfo: pictureinfo,
      jadefunctions,
      scripts: [scripts.util]
    });
  });

  /** **********************************************************************************************************
     *EDIT USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     ************************************************************************************************************ */
  router.route('/user/edit')
    .get(async (req, res) => {
      let user = await usersController.findUserById(req.user._id);
      res.render('login/edituser', {
        title: `Edit Profile - ${user.username} - Second Language World`,
        hideHeader: true,
        user,
        pictureInfo: pictureinfo,
        jadefunctions,
        scripts: [scripts.util]
      });
    })
    .post(async (req, res) => {
      await usersController.updateUser(req.body);
      res.redirect('/user/edit');
    });

  /** **********************************************************************************************************
     *VIEW USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     ************************************************************************************************************ */
  router.get('/user/:id', async (req, res) => {

    try { // Get user and reviews then render user page
      let usern = await usersController.findUserById(req.params.id);
      let reviews = await reviews.findReviewsByUser(usern);
      res.render('user', {
        title: `User ${usern.username} - Second Language World`,
        user: req.user,
        usern,
        reviews,
        pictureInfo: pictureinfo,
        jadefunctions,
        moment,
        scripts: [scripts.util]
      });
    } catch (error) {
      getLogger().error(error);
    }

  });

  router.get('/cities/:provincecode', async (req, res) => {
    const provCode = req.params.provincecode;
    let cities = await citiesController.getCitiesByProvince(provCode);
    res.send(cities);
  });

  /** **********************************************************************************************************
     *GETUSERS :
     ************************************************************************************************************ */
  router.get('/allusers', utils.isAdmin, async (req, res) => {

    try {
      let users = await usersController.getAllUsers();
      res.render('allusers', {
        title: 'Users - Second Language World',
        users,
        pictureInfo: pictureinfo,
        jadefunctions,
        moment,
        scripts: [scripts.util]
      });
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  return router;
};
