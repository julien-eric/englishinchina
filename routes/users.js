const express = require('express');
const router = express.Router();
const emailsController = require('../controllers/emailscontroller');
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');
const countriesController = require('../controllers/countriescontroller');
const usersController = require('../controllers/userscontroller');
const jobsController = require('../controllers/jobscontroller');
const crypto = require('crypto');
const bCrypt = require('bcrypt-nodejs');

module.exports = function (passport) {
    /** **********************************************************************************************************
         *LOGIN :   GET : Root Path, login page.
        *          POST: Send user login request. redirect to home if sucessful, try again if failure
        ************************************************************************************************************ */
    router.get('/login', (req, res) => {
        // Display the Login page with any flash message, if any.
        let responseInfo;
        if (res.locals.flash.responseInfo) {
            responseInfo = res.locals.flash.responseInfo[0];
        }

        res.render('login/login', {
            title: 'Login - Second Language World',
            redirectUrl: req.query.redirectUrl,
            responseInfo,
            scripts: [scripts.util]
        });
    });

    router.get('/fixuserbase', async (req, res) => {

        let users = await usersController.getAllUsers();
        users.forEach(async (user) => {
            if (user.teachingDetails) {
                let newUser = {
                    username: user.username,
                    password: user.password,
                    email: user.email,
                    verified: user.verified,
                    token: user.token,
                    avatarUrl: user.avatarUrl,
                    resetPasswordToken: user.resetPasswordToken,
                    resetPasswordExpires: user.resetPasswordExpires,
                    fb: user.fb,
                    useFacebookPic: user.useFacebookPic,

                    teachingDetails: {
                        fullName: user.firstName + ' ' + user.lastName,
                        gender: user.gender,
                        dateOfBirth: user.dateOfBirth,
                        livingCountry: user.livingCountry,
                        citizenship: user.citizenship,

                        eslCertificate: user.teachingDetails.eslCertificate,
                        teachingLicense: user.teachingDetails.teachingLicense,
                        yearsOfExperience: user.teachingDetails.yearsOfExperience,
                        urlResume: user.teachingDetails.urlResume,
                        fileNameResume: user.teachingDetails.fileNameResume,
                    }
                }
                let savedUser = await usersController.updateUser(user.id, newUser);
            }
        });
        res.redirect('/');
    });

    router.post('/login', (req, res, next) => {

        let redirectUrl = '/';
        res.flash('responseInfo', { email: req.body.email, password: req.body.password });
        if (req.body.redirectUrl) {
            redirectUrl = req.body.redirectUrl;
        }

        passport.authenticate('login', (err, user, info) => {

            if (err) {
                return next(err);
            }
            if (!user) {
                let loginPage = '/login';
                if (redirectUrl) {
                    loginPage += '?redirectUrl=' + encodeURIComponent(redirectUrl);
                }
                return res.redirect(loginPage);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect(redirectUrl);
            });
        })(req, res, next);

    });

    /** **********************************************************************************************************
         *FACEBOOK LOGIN :   Facebook login will hit callback function below (login/facebook/callback)
        ************************************************************************************************************ */
    router.get('/login/facebook', (req, res, next) => {

        if (req.query.redirectUrl) {
            req.session.redirectUrl = req.query.redirectUrl;
        }

        passport.authenticate('facebook', { scope: 'email' })(req, res, next);
    });

    router.get('/login/facebook/callback', (req, res, next) => {

        let redirectUrl = '/';
        if (req.session.redirectUrl) {
            redirectUrl = req.session.redirectUrl;
        }
        passport.authenticate('facebook', (err, user, info) => {

            if (err) {
                return next(err);
            }
            if (!user) {
                let loginPage = '/login';
                if (redirectUrl) {
                    loginPage += '?redirectUrl=' + encodeURIComponent(redirectUrl);
                }
                return res.redirect(loginPage);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect(redirectUrl);
            });
        })(req, res, next);
    });

    /** **********************************************************************************************************
        *SIGNUP :   GET : Sign up page.
    *               POST: Send user registration request. redirect to home if sucessful, try again if failure
        ************************************************************************************************************ */
    router.get('/signup', (req, res) => {

        let responseInfo;
        if (res.locals.flash.responseInfo) {
            responseInfo = res.locals.flash.responseInfo[0];
        }

        res.render('login/register', {
            title: 'Sign up - Second Language World',
            redirectUrl: req.query.redirectUrl,
            responseInfo,
            scripts: [scripts.util]
        });
    });

    router.post('/signup', (req, res, next) => {

        let redirectUrl;
        res.flash('responseInfo', { username: req.body.username, anonymous: req.body.anonymous, email: req.body.email, password: req.body.password });
        if (req.body.redirectUrl) {
            redirectUrl = req.body.redirectUrl;
        }

        passport.authenticate('signup', (err, user, info) => {

            if (err) {
                return next(err);
            }
            if (!user) {
                let signupPage = '/signup';
                if (redirectUrl) {
                    signupPage += '?redirectUrl=' + encodeURIComponent(redirectUrl);
                }
                return res.redirect(signupPage);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }

                let url = '/thankyou';
                if (redirectUrl) {
                    url += '?redirectUrl=' + encodeURIComponent(redirectUrl);
                }
                return res.redirect(url);
            });
        })(req, res, next);

    });


    /** **********************************************************************************************************
         *OPTED-IN :   GET : Sign out and redirect to Home Page
    ************************************************************************************************************ */
    router.get('/thankyou', (req, res) => {

        let redirectUrl;
        if (req.query.redirectUrl) {
            redirectUrl = req.query.redirectUrl;
        }

        res.render('login/thank-you', {
            title: 'Thank you for signing up!',
            user: req.user,
            redirectUrl,
            pictureInfo: pictureinfo,
            scripts: [scripts.util]
        });
    });


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
            user: req.user,
            pictureInfo: pictureinfo,
            scripts: [scripts.util]
        });
    });

    router.post('/forgot', async (req, res, next) => {

        const token = crypto.randomBytes(20).toString('hex');

        let user = await usersController.findUserByEmail(req.body.email);
        if (!user) {
            res.flash('error', 'Couldn\'t find a user with the email adress ' + req.body.email);
            return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        let resetPasswordLink = req.headers.origin + '/reset/' + user.resetPasswordToken;
        await emailsController.resetPassword(user.email, resetPasswordLink);
        res.flash('info', 'An email has been sent to reset your password.');

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
    router.get('/emailverification/:email', async (req, res, next) => {

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
            next(error);
        }

        res.redirect('/');
    });

    /** **********************************************************************************************************
         *EDIT USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
        ************************************************************************************************************ */
    router.route('/user')
        .get(utils.isAuthenticated, async (req, res, next) => {
            try {
                let userType = utils.validateParam(req.query.type);
                let countries = await countriesController.getCountries();
                let redirectUrl = req.query.redirectUrl;
                let jobs;

                if (req.user && req.user.employerDetails) {
                    jobs = await jobsController.getJobsByUser(req.user.id);
                }

                res.render('login/user', {
                    title: 'My Profile | Second Language World',
                    user: req.user,
                    jobs,
                    redirectUrl,
                    userType,
                    countries,
                    moment,
                    pictureInfo: pictureinfo,
                    jadefunctions,
                    scripts: [scripts.util, scripts.reviewvalidation, scripts.writereview, scripts.fileUploader, scripts.libmoment, scripts.readMore]
                });
            } catch (error) {
                next(error);
            }
        })
        .post(utils.isAuthenticated, async (req, res, next) => {
            try {

                let userParams = req.body;
                userParams.livingCountry = await countriesController.getCountryFromCode(utils.validateParam(userParams.livingCountry));
                userParams.citizenship = await countriesController.getCountryFromCode(utils.validateParam(userParams.citizenship));

                await usersController.updateUser(userParams.id, userParams);
                res.redirect('/user');
            } catch (error) {
                next(error);
            }
        });

    /** **********************************************************************************************************
         *VIEW USER :   GET : Show profile for a different user
        ************************************************************************************************************ */
    router.route('/user/teacher-profile')
        .post(async (req, res, next) => {
            try {

                let userParams = {};
                userParams.id = utils.validateParam(req.user.id);

                userParams.teachingDetails = {};
                userParams.teachingDetails.fullName = req.body.fullName;
                userParams.teachingDetails.livingCountry = await countriesController.getCountryFromCode(utils.validateParam(req.body.livingCountry));
                userParams.teachingDetails.citizenship = await countriesController.getCountryFromCode(utils.validateParam(req.body.citizenship));
                userParams.teachingDetails.dateOfBirth = new Date(moment(req.body.dateOfBirth, 'MMMM Do YYYY').format());
                userParams.teachingDetails.eslCertificate = utils.validateParam(req.body.eslCertificate);
                userParams.teachingDetails.teachingLicense = utils.validateParam(req.body.teachingLicense);
                userParams.teachingDetails.yearsOfExperience = utils.validateParam(req.body.yearsOfExperience);
                let fileNameResumePrevious = utils.validateParam(req.body.fileNameResumePrevious);

                if (fileNameResumePrevious == -1) {
                    userParams.teachingDetails.urlResume = utils.validateParam(req.body.urlResume);
                    userParams.teachingDetails.fileNameResume = utils.validateParam(req.body.fileNameResume);
                } else {
                    let user = await usersController.findUserById(userParams.id);
                    userParams.teachingDetails.urlResume = user.teachingDetails.urlResume;
                    userParams.teachingDetails.fileNameResume = user.teachingDetails.fileNameResume;
                }

                await usersController.updateUser(userParams.id, userParams);

                let redirectUrl = utils.validateParam(req.body.redirectUrl);
                if (redirectUrl != -1) {
                    res.redirect(redirectUrl);
                } else {
                    res.redirect('/user');
                }

            } catch (error) {
                res.flash('error', error.message);
                res.redirect(req.url);
            }
        });

    router.route('/user/employer-profile')
        .post(async (req, res, next) => {

            try {

                let userParams = {};
                userParams.id = utils.validateParam(req.user.id);
                userParams.employerDetails = {};
                userParams.employerDetails.name = req.body.name;
                userParams.employerDetails.description = req.body.description;
                await usersController.updateUser(userParams.id, userParams);

                let redirectUrl = utils.validateParam(req.body.redirectUrl);
                if (redirectUrl != -1) {
                    res.redirect(redirectUrl);
                } else {
                    res.redirect('/user');
                }

            } catch (error) {
                res.flash('error', error.message);
                res.redirect(req.url);
            }
        });

    return router;
};
