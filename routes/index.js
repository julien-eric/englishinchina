const express = require('express');
const router = express.Router();
const schools = require('../controllers/schools');
const email = require('../controllers/email');
const pictures = require('../pictures');
const aws = require('aws-sdk');
const moment = require('moment');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const usersController = require('../controllers/users');
const crypto = require('crypto');
const scripts = require('../scripts').scripts;
const bCrypt = require('bcrypt-nodejs');
const settings = require('simplesettings');
const fcbAppId = settings.get('FCB_APP_ID');

/** ********************************************************************************************************************************
 * isAuthenticated :  If user is authenticated in the session, call the next() to call the next request handler
 Passport adds this method to request object. A middleware is allowed to add properties to
 request and response objects
 * @param {*} req HTTP Request
 * @param {*} res HTTP Request
 * @param {*} next callback
 * @return {Object} The return of the callback function
 *********************************************************************************************************************************/
const isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/login');
};


module.exports = function(passport) {
  /** ********************************************************************************************************************************
     //USER RELATED GET AND POST ROUTES
     ********************************************************************************************************************************** */

  /** **********************************************************************************************************
     *HOME PAGE : Root page fromwhere users can search schools. Page can be loaded even if users are not logged in
     ************************************************************************************************************ */
  router.get('/', async (req, res) => {

    let provinces = await provincesController.getAllProvinces();
    let featuredSchools = await schools.featuredSchools();
    let popularCities = await citiesController.getMostPopularCities();
    let popularProvinces = await provincesController.getMostPopularProvinces();

    const pageSize = 5;
    let admin = false;
    if (req.user == undefined || req.user.admin == undefined) {
      admin = false;
    } else {
      admin = req.user.admin;
    }

    let schoolList = await schools.getSchools(pageSize, 0, admin);
    const truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 150);

    res.render('home', {
      title: 'English in China',
      fcbAppId,
      main: true,
      featuredSchoolList: featuredSchools,
      schools: truckSchoolList,
      user: req.user,
      provinces,
      pictureInfo: pictureinfo,
      jadefunctions,
      popularCities,
      popularProvinces,
      cities: {},
      currentPage: 1,
      total: schoolList.count,
      totalPages: ((schoolList.count - (schoolList.count % pageSize)) / pageSize) + 1,
      scripts: [scripts.librater, scripts.util, scripts.rating]
    });
  });


  router.get('/page/:page', async (req, res) => {

    let provinces = await provincesController.getAllProvinces();
    let popularCities = await citiesController.getMostPopularCities();
    let popularProvinces = await provincesController.getMostPopularProvinces();

    const page = req.params.page;
    const pageSize = 5;
    let admin = false;

    if (req.user == undefined || req.user.admin == undefined) {
      admin = false;
    } else {
      admin = req.user.admin;
    }
    let schoolList = await schools.getSchools(pageSize, page - 1, admin);
    const trunkSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 150);
    res.render('home', {
      title: `English in China - Page ${page}`,
      fcbAppId,
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
      res.render('login', {
        title: 'Login - English in China',
        fcbAppId,
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
      'loginpanel', {
        title: 'Login - English in China',
        fcbAppId,
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
      res.render('register', {
        title: 'Sign up - English in China',
        fcbAppId,
        message: req.flash('message'),
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
      title: 'Forgot your Password - English in China',
      fcbAppId,
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
      title: 'Reset Password - English in China',
      fcbAppId,
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
  router.get('/user', isAuthenticated, async (req, res) => {
    let reviews = await reviews.findReviewsByUser(req.user._id);
    res.render('user', {
      title: `User ${req.user.username} - English in China`,
      fcbAppId,
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
      res.render('edituser', {
        title: `Edit Profile - ${user.username} - English in China`,
        fcbAppId,
        user,
        pictureInfo: pictureinfo,
        jadefunctions,
        scripts: [scripts.util]
      });
    })
    .post(async (req, res) => {
      let user = await usersController.updateUser(req.body);
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
        title: `User ${usern.username} - English in China`,
        fcbAppId,
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

  /** ********************************************************************************************************************************
     //UTILS
     ********************************************************************************************************************************** */

  /** **********************************************************************************************************
     * pictureUploaded : POST// After original picture is uploaded to S3, server will create responsive images for faster loading times
     * pictureURL : string
     ************************************************************************************************************ */
  router.post('/pictureuploaded', (req, res) => {
    pictures.createResponsivePictures(req.query.url, req.query.filename, req.query.filesize, () => {
      console.log('DAMN');
    });
  });

  /** **********************************************************************************************************
     *GETUSERS :
     ************************************************************************************************************ */
  router.get('/allusers', isAuthenticated, async (req, res) => {
    if (req.user.admin) {
      let users = await usersController.getAllUsers();
      res.render('allusers', {
        title: 'Users - English in China',
        fcbAppId,
        users,
        pictureInfo: pictureinfo,
        jadefunctions,
        moment,
        scripts: [scripts.util]
      });
    } else {
      return 'nice try';
    }
  });
  /** **********************************************************************************************************
     * sign_s3 : GET get signed request to upload to server directly.
     ************************************************************************************************************ */
  router.get('/sign_s3', (req, res) => {
    aws.config.update(
      {
        accessKeyId: settings.get('S3_KEY'),
        secretAccessKey: settings.get('S3_SECRET')
      });

    const s3 = new aws.S3();
    const S3Params = {
      Bucket: settings.get('S3_BUCKET'),
      Key: req.query.file_name,
      Expires: 60,
      ContentType: req.query.file_type,
      ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', S3Params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const returnData = {
          signed_request: data,
          url: req.query.file_name
        };
        res.write(JSON.stringify(returnData));
        res.end();
      }
    });
  });
  return router;
};
