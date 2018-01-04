// import {getLogger} from '../../../AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/nodemailer/lib/shared';
const express = require('express');
const router = express.Router();
const schools = require('../controllers/schools');
const companies = require('../controllers/companies');
const reviews = require('../controllers/reviews');
const email = require('../controllers/email');
// var provinces = require('../provinces');
const pictures = require('../pictures');
const aws = require('aws-sdk');
const moment = require('moment');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const usersController = require('../controllers/users');
const articlesController = require('../controllers/articles');
const async = require('async');
const crypto = require('crypto');
const scripts = require('../scripts').scripts;
const bCrypt = require('bcrypt-nodejs');

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
  router.get('/', (req, res) => {
    async.waterfall([
      // 1) First get provinces list
      function getProvinces(done) {
        provincesController.getAllProvinces((provinces) => {
          done(null, provinces);
        });
      },
      // 2) Then get featured schools for jumbotron
      function getFeaturedSchools(provinces, done) {
        schools.featuredSchools((err, featuredSchoolList) => {
          done(null, provinces, featuredSchoolList);
        });
      },
      function getPopularCities(provinces, featuredSchoolList, done) {
        citiesController.getMostPopularCities((popularCities) => {
          done(null, provinces, featuredSchoolList, popularCities);
        });
      },
      function getPopularProvinces(provinces, featuredSchoolList, popularCities, done) {
        provincesController.getMostPopularProvinces((popularProvinces) => {
          done(null, provinces, featuredSchoolList, popularCities, popularProvinces);
        });
      },
      // 3) Lastly Get paginated list of schools
      function getSchools(provinces, featuredSchoolList, popularCities, popularProvinces) {
        const pageSize = 5;
        let admin = false;
        if (req.user == undefined || req.user.admin == undefined) {
          admin = false;
        } else {
          admin = req.user.admin;
        }

        schools.getSchools((count, schoolList) => {
          const truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 150);

          res.render('home', {
            title: 'English in China',
            main: true,
            featuredSchoolList,
            schools: truckSchoolList,
            user: req.user,
            provinces,
            pictureInfo: pictureinfo,
            jadefunctions,
            popularCities,
            popularProvinces,
            cities: {},
            currentPage: 1,
            total: count,
            totalPages: ((count - (count % pageSize)) / pageSize) + 1,
            scripts: [scripts.librater, scripts.util, scripts.rating],
          });
        }, pageSize, 0, admin);
      },
    ], (err) => {
      if (err) console.log(err);
      // res.redirect('/');
    });
  });


  router.get('/page/:page', (req, res) => {
    async.waterfall([
      // 1) First get provinces list
      function getProvinces(done) {
        provincesController.getAllProvinces((provinces) => {
          done(null, provinces);
        });
      },
      function getPopularCities(provinces, done) {
        citiesController.getMostPopularCities((popularCities) => {
          done(null, provinces, popularCities);
        });
      },
      function getPopularProvinces(provinces, popularCities, done) {
        provincesController.getMostPopularProvinces((popularProvinces) => {
          done(null, provinces, popularCities, popularProvinces);
        });
      },
      // 3) Lastly Get paginated list of schools
      function getSchools(provinces, popularCities, popularProvinces) {
        const page = req.params.page;
        const pageSize = 5;
        let admin = false;

        if (req.user == undefined || req.user.admin == undefined) {
          admin = false;
        } else {
          admin = req.user.admin;
        }
        schools.getSchools((count, schoolList) => {
          const trunkSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 150);
          res.render('home', {
            title: `English in China - Page ${page}`,
            schools: trunkSchoolList,
            user: req.user,
            provinces,
            pictureInfo: pictureinfo,
            jadefunctions,
            popularCities,
            popularProvinces,
            currentPage: page,
            total: count,
            totalPages: ((count - (count % pageSize)) / pageSize) + 1,
            scripts: [scripts.librater, scripts.util, scripts.rating],
          });
        }, pageSize, page - 1, admin);
      },
    ], (err) => {
      if (err) console.log(err);
      // res.redirect('/');
    });
  });

  /** ********************************************************************************************************************************
     //COMPANY RELATED ROUTES
    ********************************************************************************************************************************** */
  router.route('/company/addcompany')
    .get((req, res) => {
      res.render('company/addcompany', {
        title: 'Add Company - English in China',
        message: req.flash('message'),
        scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE],
      });
    })
    .post((req, res) => {
      const company = {
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        pictureUrl: req.body.pictureUrl,
        logoUrl: req.body.logoUrl,
      };
      companies.addCompany(company, (newCompany) => {
        res.redirect(`/company/id/${newCompany.id}`);
      });
    });

  router.route('/company/edit/:id')
    .get((req, res) => {
      companies.findCompanyById(req.params.id, (company) => {
        res.render('company/editcompany', {
          title: `Edit ${company.name} - English in China`,
          company,
          message: req.flash('message'),
          pictureInfo: pictureinfo,
          scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE],
        });
      });
    })
    .post((req, res) => {
      const company = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        pictureUrl: req.body.pictureUrl,
        logoUrl: req.body.logoUrl,
      };
      companies.editCompany(company, (err, newCompany) => {
        res.redirect(`/company/id/${newCompany.id}`);
      });
    });


  router.get('/company/id/:id', (req, res) => {
    async.waterfall([
      function findCompany(done) {
        companies.findCompanyById(req.params.id, (company) => {
          done(null, company);
        });
      },

      function getPopularCities(company, done) {
        citiesController.getMostPopularCities((popularCities) => {
          done(null, company, popularCities);
        });
      },
      function getPopularProvinces(company, popularCities, done) {
        provincesController.getMostPopularProvinces((popularProvinces) => {
          done(null, company, popularCities, popularProvinces);
        });
      },
      function getSchoolList(company, popularCities, popularProvinces, done) {
        schools.findSchoolsByCompany(company.id, (err, schoolList) => {
          done(err, company, popularCities, popularProvinces, schoolList);
        });
      },
      function getprovincesByCompany(company, popularCities, popularProvinces, schoolList, done) {
        provincesController.getMostPopularProvincesbyCompany(req.params.id, (provincesByCompany) => {
          done(null, company, popularCities, popularProvinces, schoolList, provincesByCompany);
        });
      },
      function finish(company, popularCities, popularProvinces, schoolList, provincesByCompany) {
        const truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 150);
        res.render('company/company', {
          title: `${company.name} - English in China`,
          company,
          user: req.user,
          moment,
          jadefunctions,
          popularCities,
          popularProvinces,
          provincesByCompany,
          schools: truckSchoolList,
          pictureInfo: pictureinfo,
          scripts: [scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolpage],
        });
      },
    ], (err, callback) => {
      if (err) {
        console.log(err);
      }
    });
  });

  /** **********************************************************************************************************
     *LOGIN :   GET : Root Path, login page.
     *          POST: Send user login request. redirect to home if sucessful, try again if failure
     ************************************************************************************************************ */
  router.route('/login')
    .get((req, res) => {
      // citiesController.pushCities(citiesController.citiesToPush);
      // Display the Login page with any flash message, if any
      res.render('login', {
        title: 'Login - English in China',
        message: req.flash('message'),
        scripts: [scripts.util],
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
        message: req.flash('message'),
        redirecturl: req.query.url,
        scripts: [scripts.util],
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
      failureRedirect: '/',
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
        message: req.flash('message'),
        scripts: [scripts.util],
      });
    })
    .post(passport.authenticate('signup', {
      successRedirect: '/',
      failureRedirect: '/signup',
      failureFlash: true,
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
      user: req.user,
      pictureInfo: pictureinfo,
      scripts: [scripts.util],
    });
  });

  router.post('/forgot', (req, res, next) => {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        usersController.findUserByEmail(req.body.email, (err, user) => {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save((err) => {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        email.resetPassword(req, user, token, req, done);

        // var smtpTransport = nodemailer.createTransport({
        //    service: "sendGrid",
        //    host : "smtp.sendgrid.net",
        //    secureConnection : false,
        //    port: 587,
        //    auth : {
        //        user : "jueri",
        //        pass : "Montreal123!"
        //    }
        // });
        //
        // var mailOptions = {
        //    to: user.email,
        //    from: 'passwordreset@englishinchina.co',
        //    subject: 'English in China Password Reset',
        //    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        //    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        //    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        //    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        // };
        // smtpTransport.sendMail(mailOptions, function(err) {
        //    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        //    done(err, 'done');
        // });
      },
    ], (err) => {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  router.get('/reset/:token', (req, res) => {
    usersController.findUserByToken(req.params.token, {$gt: Date.now()}, (err, user) => {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        title: 'Reset Password - English in China',
        pictureInfo: pictureinfo,
        scripts: [scripts.util],
      });
    });
  });

  router.post('/reset/:token', (req, res) => {
    usersController.findUserByToken(req.params.token, {$gt: Date.now()}, (err, user) => {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('back');
      }

      // Generates hash using bCrypt
      const createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
      };
      user.password = createHash(req.body.password);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      user.save((err) => {
        req.logIn(user, (err) => res.redirect('/'));
      });
    });
  });

  router.post('/contactus', (req, res) => {
    const message = `Email: ${req.body.email}\n${req.body.content}`;
    const callbackMessage = 'Thank you, we will get back to you shortly';
    email.sendEmail('julieneric11@gmail.com',
      'contactusfeedback@englishinchina.com',
      'Feedback comment from user',
      message,
      callbackMessage,
      req,
      () => {
      res.redirect('/');
    });
  });

  /** **********************************************************************************************************
     *USER :   GET : If user is authenticated, send him to view myprofile page, else redirect to login
     * This method is not the general one to view a different user.
     ************************************************************************************************************ */
  router.get('/user', isAuthenticated, (req, res) => {
    reviews.findReviewsByUser(req.user._id, (reviews) => {
      res.render('user', {
        title: `User ${req.user.username} - English in China`,
        user: req.user,
        reviews,
        pictureInfo: pictureinfo,
        jadefunctions,
        scripts: [scripts.util],
      });
    });
  });

  /** **********************************************************************************************************
     *EDIT USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     ************************************************************************************************************ */
  router.route('/user/edit')
    .get((req, res) => {
      usersController.findUserById(req.user._id, (user) => {
        res.render('edituser', {
          title: `Edit Profile - ${user.username} - English in China`,
          user,
          pictureInfo: pictureinfo,
          jadefunctions,
          scripts: [scripts.util],
        });
      });
    })
    .post((req, res) => {
      usersController.updateUser(req.body, (user) => {
        res.redirect('/user/edit');
      });
    });

  /** **********************************************************************************************************
     *VIEW USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     ************************************************************************************************************ */
  router.get('/user/:id', (req, res) => {
    usersController.findUserById(req.params.id, (usern) => {
      reviews.findReviewsByUser(usern, (reviews) => {
        res.render('user', {
          title: `User ${usern.username} - English in China`,
          user: req.user,
          usern,
          reviews,
          pictureInfo: pictureinfo,
          jadefunctions,
          moment,
          scripts: [scripts.util],
        });
      });
    });
  });

  /** **********************************************************************************************************
     * ARTICLES
     ************************************************************************************************************ */
  router.route('/articles/add')
    .get((req, res) => {
      res.render('article/addarticle', {
        pictureInfo: pictureinfo,
        user: req.user,
        jadefunctions,
        moment,
        scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE],
      });
    })
    .post((req, res) => {
      articlesController.addArticle(req.user, req.body, (err, article) => {
        res.redirect(`/articles/${article.url}`);
      });
    });

  router.get('/articles/:url', async (req, res) => {

    const url = req.params.url;
    let article = await articlesController.getArticleByURL(url);
    res.render('article/article', {
      article,
      user: req.user,
      pictureInfo: pictureinfo,
      jadefunctions,
      moment,
      scripts: [scripts.util],
    });

  });

  router.get('/articles', async (req, res) => {

    let articles = await articlesController.getArticles();
    articles = jadefunctions.trunkArticlesContent(articles, 150);
    res.render('article/articles', {
      articles,
      user: req.user,
      pictureInfo: pictureinfo,
      jadefunctions,
      moment,
      scripts: [scripts.util],
    });

  });


  /** **********************************************************************************************************
     * This method is not the general one to view a different user.
     ************************************************************************************************************ */
  router.get('/cities/:provincecode', (req, res) => {
    const provCode = req.params.provincecode;
    citiesController.getCitiesByProvince(provCode, (cities) => {
      res.send(cities);
    });
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
  router.get('/allusers', isAuthenticated, (req, res) => {
    if (req.user.admin) {
      usersController.getAllUsers((users) => {
        res.render('allusers', {
          title: 'Users - English in China',
          users,
          pictureInfo: pictureinfo,
          jadefunctions,
          moment,
          scripts: [scripts.util],
        });
      });
    } else {
      return 'nice try';
    }
  });
  /** **********************************************************************************************************
     * sign_s3 : GET get signed request to upload to server directly.
     ************************************************************************************************************ */
  router.get('/sign_s3', (req, res) => {
    aws.config.update({
      accessKeyId: 'AKIAJFGLJ3FU42D22YKQ',
      secretAccessKey: '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',
    });

    const s3 = new aws.S3();
    const S3Params = {
      Bucket: 'englishinchinaasia',
      Key: req.query.file_name,
      Expires: 60,
      ContentType: req.query.file_type,
      ACL: 'public-read',
    };
    s3.getSignedUrl('putObject', S3Params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const returnData = {
          signed_request: data,
          url: req.query.file_name,
        };
        res.write(JSON.stringify(returnData));
        res.end();
      }
    });
  });
  return router;
};
