const express = require('express');
const router = express.Router();
const email = require('../controllers/email');
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const schoolsController = require('../controllers/schools');
const provincesController = require('../controllers/provinces');
const companiesController = require('../controllers/companies');
const citiesController = require('../controllers/cities');
const usersController = require('../controllers/users');
const jobsController = require('../controllers/jobs');
const crypto = require('crypto');
const scripts = require('../public/scripts');
const bCrypt = require('bcrypt-nodejs');
const utils = require('../utils');

module.exports = function (passport) {

  // Home Page
  router.get('/', async (req, res) => {

    try {
      let provinces = await provincesController.getAllProvinces();
      let popularCities = await citiesController.getMostPopularCities();
      let featuredJobs = await jobsController.getFeaturedJobs();
      let popularProvinces = await provincesController.getMostPopularProvinces();
      let popularCompanies = await companiesController.findCompaniesWithSchoolsAndReviews();

      const splashText = require('../splash-text.json');
      popularCompanies = jadefunctions.trunkContentArray(popularCompanies, 'description', 180);
      res.render('home/home', {
        title: 'Second Language World',
        main: true,
        user: req.user,
        provinces,
        pictureInfo: pictureinfo,
        jadefunctions,
        featuredJobs,
        popularCities,
        popularProvinces,
        popularCompanies,
        splashText,
        currentPage: 1,
        scripts: [scripts.librater, scripts.util, scripts.rating, scripts.typeahead, scripts.typeaheadwrapper]
      });
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  /** **********************************************************************************************************
     *search : Method for search site, it will return any school, company, job that has some of the information
     * Param : Query, string that will be looked for
     ************************************************************************************************************ */
  router.get('/search/', async (req, res) => {

    try {

      const searchInfo = {};
      searchInfo.sort = req.query.sort;

      searchInfo.queryInfo = req.query.queryInfo;

      searchInfo.cityCode = utils.validateQuery(req.query.city);
      searchInfo.cityCode ? searchInfo.city = await citiesController.getCityByCode(searchInfo.cityCode) : null;
      searchInfo.provinceCode = utils.validateQuery(req.query.province);


      if (searchInfo.cityCode != -1 && searchInfo.provinceCode == -1) {
        searchInfo.provinceCode = searchInfo.city.province.code;
        searchInfo.province = await provincesController.getProvinceByCode(searchInfo.provinceCode);
      }

      searchInfo.provinceCode ? searchInfo.province = await provincesController.getProvinceByCode(searchInfo.provinceCode) : null;

      let schools = [];
      let companies = [];
      let jobs = [];

      schools = await schoolsController.searchSchools(searchInfo.queryInfo, searchInfo.provinceCode, searchInfo.cityCode, utils.getSchoolSortingObject(searchInfo.sort));
      if (schools != undefined && schools.list != undefined && schools.list.length > 0) {
        schools.list = jadefunctions.trunkContentArray(schools.list, 'description', 150);
      }

      companies = await companiesController.searchCompanies(searchInfo.queryInfo, searchInfo.provinceCode, searchInfo.cityCode);
      if (companies != undefined && companies.list != undefined && companies.list.length > 0) {
        companies.list = jadefunctions.trunkContentArray(companies.list, 'description', 150);
      }

      jobs = await jobsController.searchJobs(searchInfo.queryInfo, searchInfo.provinceCode, searchInfo.cityCode);
      if (jobs != undefined && jobs.list != undefined && jobs.list.length > 0) {
        jobs.list = jadefunctions.trunkContentArray(jobs.list, 'description', 150);
      }

      let bannerPicture
      if (searchInfo.city) {
        bannerPicture = await citiesController.getCityPic(searchInfo.cityCode);
      } else if (searchInfo.province) {
        bannerPicture = await provincesController.getProvincePic(searchInfo.provinceCode);
      }

      // Fetch list of all provinces and cities.
      let provinces = await provincesController.getAllProvinces();
      let cities = undefined;
      if (searchInfo.provinceCode != -1) {
        cities = await citiesController.getProvinceCitiesByCode(searchInfo.provinceCode);
      }

      // title: `${searchResults.query} Schools - Second Language World`,
      res.render('search/search', {
        title: `Schools - Second Language World`,
        main: true,
        schools: schools.list,
        jobs: jobs.list,
        companies: companies.list,
        searchInfo,
        user: req.user,
        provinces,
        cities,
        pictureInfo: pictureinfo,
        bannerPicture,
        jadefunctions,
        scripts: [scripts.util, scripts.typeahead, scripts.searchPage, scripts.typeaheadwrapper]
      });

    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  /** **********************************************************************************************************
     *queryProvinces : Method for search all provinces, it will return any province that has some of the information
     * Param : Query, string that will be looked for as part of the province's name
     ************************************************************************************************************ */
  router.get('/queryprovinces', async (req, res) => {

    try {
      const searchInfo = req.query.searchInfo || undefined;
      const limit = parseInt(req.query.limit) || undefined;
      let provinces = await provincesController.queryProvincesByName(searchInfo, limit);
      res.send(JSON.stringify({ query: 'provinces', list: provinces.list, total: provinces.total}));
    } catch (error) {
      res.send(error);
    }
  });

  /** **********************************************************************************************************
     *queryCities : Method for search all cities, it will return any city that has some of the information
     * Param : Query, string that will be looked for as part of the city's name
     ************************************************************************************************************ */
  router.get('/querycities', async (req, res) => {

    try {
      const searchInfo = req.query.searchInfo || undefined;
      const limit = parseInt(req.query.limit) || undefined;
      let cities = await citiesController.queryCityiesByPinyinName(searchInfo, limit);
      res.send(JSON.stringify({ query: 'cities', list: cities.list, total: cities.total}));
    } catch (error) {
      res.send(error);
    }
  });

  router.get('/about', async (req, res) => {

    try {
      let provinces = await provincesController.getAllProvinces();
      let popularCities = await citiesController.getMostPopularCities();
      let popularProvinces = await provincesController.getMostPopularProvinces();

      const splashText = require('../splash-text.json');
      res.render('home/about', {
        title: 'Second Language World',
        user: req.user,
        provinces,
        pictureInfo: pictureinfo,
        jadefunctions,
        popularCities,
        popularProvinces,
        splashText,
        currentPage: 1,
        scripts: [scripts.librater, scripts.util, scripts.rating, scripts.typeahead, scripts.typeaheadwrapper]
      });
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
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
        main: true,
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
          res.send({ html });
        }
      },
    );
  });

  /** **********************************************************************************************************
     *FACEBOOK LOGIN :   Facebook login will hit callback function below (login/facebook/callback)
     ************************************************************************************************************ */
  router.get(
    '/login/facebook',
    passport.authenticate('facebook', { scope: 'email' }),
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
        main: true,
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
    res.render('login/forgot', {
      title: 'Forgot your Password - Second Language World',
      main: true,
      user: req.user,
      pictureInfo: pictureinfo,
      scripts: [scripts.util]
    });
  });

  router.post('/forgot', async (req, res, next) => {

    const token = crypto.randomBytes(20).toString('hex');

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

  /** **********************************************************************************************************
   *PASSWORD RESET
  ************************************************************************************************************ */

  router.get('/reset/:token', async (req, res) => {
    let user = await usersController.findUserByToken(req.params.token, { $gt: Date.now() });
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('login/reset', {
      title: 'Reset Password - Second Language World',
      main: true,
      token: user.resetPasswordToken,
      pictureInfo: pictureinfo,
      scripts: [scripts.util]
    });
  });

  router.post('/reset', async (req, res) => {
    let user = await usersController.findUserByToken(req.body.token, { $gt: Date.now() });
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('back');
    }

    // Generate hash using bCrypt
    const createHash = function (password) {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
    user.password = createHash(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    req.login(user, (err) => res.redirect('/'));
  });



  /** **********************************************************************************************************
     *EMAIL VERIFICATION
     * If token is correct and not expired, this will redirect a logged in user to the main page
     ************************************************************************************************************ */
  router.get('/emailverification/:email', async (req, res) => {

    try {

      let token = req.query.token;
      let user = await usersController.findUserByEmail(req.params.email);
      if (!user.verified) {
        if (user.token == token) {
          let updatedUser = await usersController.updateUser(user._id, { verified: true });
          req.login(updatedUser, (err) => res.redirect('/'));
        }
      }
    } catch (error) {
      console.log(error);
    }

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
      try {

        let user = await usersController.findUserById(req.user._id);
        res.render('login/edituser', {
          title: `Edit Profile - ${user.username} - Second Language World`,
          main: true,
          user,
          pictureInfo: pictureinfo,
          jadefunctions,
          scripts: [scripts.util]
        });
      } catch (error) {
        res.render('error', {
          message: error.message,
          error: error
        });
      }
    })
    .post(async (req, res) => {
      try {
        req.body.anonymous ? req.body.anonymous = true : req.body.anonymous = false;
        await usersController.updateUser(req.body.id, req.body);
        res.redirect('/user/edit');
      } catch (error) {
        res.render('error', {
          message: error.message,
          error: error
        });
      }
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
    let cities = await citiesController.getProvinceCitiesByCode(provCode);
    res.send(cities);
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
