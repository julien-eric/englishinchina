const express = require('express');
const moment = require('moment');
const email = require('../controllers/emailscontroller');
const winston = require('../config/winstonconfig');
const router = express.Router();
const schools = require('../controllers/schoolscontroller');
const reviews = require('../controllers/reviewscontroller');
const images = require('../controllers/imagescontroller');
const usersController = require('../controllers/userscontroller');
const provincesController = require('../controllers/provincescontroller');
const citiesController = require('../controllers/citiescontroller');
const companiesController = require('../controllers/companiescontroller');
const searchController = require('../searchcontroller');
const jadefunctions = require('../jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const criteria = require('../criteria').criteria;
const scripts = require('../public/scripts');
const utils = require('../utils');

const MISSING = -1;

module.exports = function (passport) {
    /** ********************************
      //SCHOOL ROUTES
      ********************************** */
    /** **********************************************************************************************************
       *AddSchool : Method for loading page for creating a new school. As well as POST request from website to process creation
       * Param : user, verify user validity and store in DB, to enable editing school
       ************************************************************************************************************ */
    router.route('/addschool')
        .get(utils.isAuthenticated, async (req, res) => {
            try {
                let incompleteSchool;
                if (req.query.name !== undefined || req.query.schoolType !== undefined) {
                    incompleteSchool = { name: decodeURIComponent(req.query.name), schoolType: parseInt(req.query.type) };
                }
                let provinces = await provincesController.getAllProvinces();
                let companies = await companiesController.getAllCompanies();
                res.render('school/addschool', {
                    title: 'Add School - Second Language World',
                    user: req.user,
                    pictureInfo: pictureinfo,
                    provinces,
                    companies,
                    incompleteSchool,
                    scripts: [scripts.util, scripts.fileUploader, scripts.typeahead, scripts.typeaheadwrapper, scripts.libtinyMCE, scripts.tinyMCE]
                });
            } catch (error) {
                next(error);
            }
        })
        .post(async (req, res) => {
            newSchool = await schools.addSchool(req.user, req.body);

            // Send Email to admin to advise the creation of a new school
            const message = `Email: ${newSchool.name}\n${newSchool.description}`;
            const callbackMessage = 'Thank you, we will get back to you shortly';
            await email.sendEmail('julieneric11@gmail.com',
                'newschoolcreated@englishinchina.com',
                `School Created ${newSchool.name}`,
                message,
                callbackMessage,
                req);

            if (req.body.ajax) {
                res.send(JSON.stringify(newSchool));
            } else {
                // redirect the user to its new school
                res.redirect(`/school/${newSchool.id}`);
            }
        });

    /** **********************************************************************************************************
       *Addphoto : Add photo to a school
       * Param : School id
       ************************************************************************************************************ */
    router.get('/addphoto/:id', async (req, res) => {
        let school = await schools.findSchoolById(req.params.id);
        res.render('addphoto', {
            title: 'Upload Picture - Second Language World',
            school,
            scripts: [scripts.util, scripts.fileUploader]
        });
    });

    router.get('/addphotoajax/:id', async (req, res) => {
        let school = schools.findSchoolById(req.params.id);
        res.render(
            'addphoto', {
                title: 'Upload Picture - Second Language World',
                school
            },
            (error, html) => {
                if (error) {
                    winston.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                } else {
                    res.send({ html });
                }
            },
        );
    });

    router.post('/addphoto', async (req, res) => {
        const picture = { url: req.body.urlSchoolUserPicture, description: req.body.description };
        let school = await schools.findSchoolById(req.body.id);
        let image = await images.addImage(
            {
                type: 1,
                user: req.user,
                school,
                url: picture.url,
                description: picture.description,
                date: Date.now()
            });
        school.photos.push(image);
        await schools.updatePictures(school);
        res.redirect(`/school/${school._id}`);
    });

    router.get('/getphoto/:id', (req, res) => {
        images.getImageById(req.params.id, (image) => {
            res.render(
                'photomodal', {
                    title: 'View Picture - Second Language World',
                    photo: image[0],
                    pictureInfo: pictureinfo
                },
                (err, html) => {
                    if (err) {
                        res.send({ html: err.toString() });
                    } else {
                        res.send({ html });
                    }
                },
            );
        });
    });

    router.get('/updatecoverphoto/:photoid/:schoolid', (req, res) => {
        const photoId = req.params.photoid;
        const schoolId = req.params.schoolid;

        images.getImageById(photoId, (photolist) => {
            schools.updateCoverPicture(schoolId, photolist[0].url, (editedschool) => {
                res.redirect('/');
            });
        });
    });

    /** **************************************************************************************************************
       * getmorereviews
       ************************************************************************************************************** */
    router.get('/reviews/:schoolid/:page', async (req, res, next) => {
        try {
            const page = req.params.page;
            const schoolId = req.params.schoolid;
            let reviews = await reviews.findReviews(schoolId, 6, page, true, req.user._id.id);
            res.render('reviews/reviews', {
                title: 'Reviews - Second Language World',
                reviews,
                pictureInfo: pictureinfo,
                jadefunctions,
                scripts: [scripts.util]
            });
        } catch (error) {
            next(error);
        }
    });

    /** **************************************************************************************************************
       * get Ajax review
       ************************************************************************************************************** */
    router.get('/reviews/:id', async (req, res) => {
        let ajax = decodeURIComponent(req.query.ajax);
        const reviewId = req.params.id;
        let userId = undefined;
        if (req.user) {
            userId = await usersController.findUserById(req.user._id);
        }

        const review = await reviews.findReviewById(reviewId, userId);
        review.comment = jadefunctions.nl2br(review.comment, false);

        if (ajax) {
            res.render('review/review', {
                review,
                loggedin: 'true',
                pictureInfo: pictureinfo,
                jadefunctions,
                scripts: [scripts.util],
                criteria,
                moment,
                criteriaScore: review.criteria
            }, (error, html) => {
                if (error) {
                    winston.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                } else {
                    res.send({ html });
                }
            });
        } else {
            reviews.findReviews(review.foreignId.id, (otherReviews) => {
                res.render('school/review', {
                    title: `${review.foreignId.name} - review by ${review.user.username} - ${review.comment} - Second Language World`,
                    review,
                    reviews: otherReviews,
                    pictureInfo: pictureinfo,
                    jadefunctions,
                    scripts: [scripts.util, scripts.libbarchart, scripts.schoolPage],
                    criteria,
                    moment,
                    criteriaScore: review.criteria
                });
            }, 9, 1, true);
        }
    });

    /** **************************************************************************************************************
       * This review was helpful
       ************************************************************************************************************** */
    // router.post('/helpfuls/:type/:id', async (req, res) => {
    router.post('/helpfuls/:type/:id', utils.isAuthenticated, async (req, res, next) => {

        try {

            const reviewId = req.params.id;
            const userId = await usersController.findUserById(req.user._id);
            let review = await reviews.findReviewById(reviewId, userId);

            // Update Review to account for new helpful
            let updatedReview = undefined;
            if (!review.hasHF) {
                updatedReview = await reviews.addHelpful(review, { user: userId });
                updatedReview.hasHF = true;
            } else {
                updatedReview = await reviews.removeHelpful(review, { user: userId });
                updatedReview.hasHF = false;
            }

            res.render('helpfulshort', {
                review: updatedReview,
                loggedin: 'true'
            }, (error, html) => {
                if (error) {
                    winston.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                } else {
                    res.send({ html, result: '1', reviewId: updatedReview.id });
                }
            });

            // In the background send email to user who has written the review
            const user = review.user;
            if (user.email != undefined) {
                email.createReviewHelpfulMessage(res, review.user.username, review.helpfuls.length, review.foreignId.id, (message) => {
                    const callbackMessage = 'Thank you';
                    email.sendEmail(user.email,
                        'reviews@englishinchina.com',
                        `Review Feedback on ${review.foreignId.name}`,
                        message,
                        callbackMessage,
                        req,
                        () => { });
                });
            }
        } catch (error) {
            next(error);
        }

    });


    /** **********************************************************************************************************
       *searchSchool : Method for search all schools, it will return any school that has some of the information
       * Param : Query, string that will be looked for as part of the schools name
       * [Province] optional.
       * [City] optional
       ************************************************************************************************************ */
    router.get('/search/', async (req, res, next) => {

        try {
            const queryInfo = req.query.queryInfo;
            const province = utils.validateParam(req.query.province);
            const city = utils.validateParam(req.query.city);
            const sorting = req.query.sort;

            let searchResults = await schools.searchSchools(queryInfo, province, city, sorting);
            if (searchResults != undefined && searchResults.list != undefined && searchResults.list.length > 0) {
                searchResults.list = jadefunctions.trunkContentArray(searchResults.list, 'description', 150);
            }

            // let popularCities = await citiesController.getMostPopularCities();
            // let popularProvinces = await provincesController.getMostPopularProvinces();
            let popularCities = undefined;
            let popularProvinces = undefined;

            let provinces = await provincesController.getAllProvinces();
            let cities = undefined;
            if (province) {
                cities = await citiesController.getProvinceCitiesByCode(province);
            }
            res.render('search', {
                title: `${searchResults.query} Schools - Second Language World`,
                schools: searchResults.list,
                user: req.user,
                provinces,
                cities,
                pictureInfo: pictureinfo,
                popularCities,
                popularProvinces,
                searchMessage: `You searched for ${searchResults.query}`,
                searchInfo: searchResults.searchInfo,
                jadefunctions,
                scripts: [scripts.util, scripts.typeahead, scripts.typeaheadwrapper]
            });
        } catch (error) {
            next(error);
        }
    });

    /** **********************************************************************************************************
       *searchSchool : Method for search all schools, it will return any school that has some of the information
       * Param : Query, string that will be looked for as part of the schools name
       * [Province] optional.
       * [City] optional
       ************************************************************************************************************ */
    router.get('/query/', async (req, res) => {

        try {

            let queryInfo = req.query.queryInfo || undefined;
            let province = utils.validateParam(req.query.province);
            let city = utils.validateParam(req.query.city);
            const limit = parseInt(req.query.limit) || undefined;

            let locationInfo = await searchController.pluckLocationTerms(queryInfo);

            if (city == MISSING && locationInfo.location.city) {
                city = locationInfo.location.city;
            }

            if (province == MISSING && locationInfo.location.province) {
                province = locationInfo.location.province;
            }

            for (let i = 0; i < locationInfo.positiveTerms.length; i++) {
                let firstOccurence = queryInfo.toLowerCase().indexOf(locationInfo.positiveTerms[i].toLowerCase());
                if (firstOccurence != -1) {
                    queryInfo = queryInfo.substring(0, firstOccurence) +
                        queryInfo.substring(firstOccurence + locationInfo.positiveTerms[i].length, queryInfo.length);
                }
            }


            let searchResults = await schools.searchSchools(queryInfo, province, city, undefined, limit, true);
            res.send(JSON.stringify({ query: 'schools', list: searchResults.list, total: searchResults.total }));
        } catch (error) {
            res.send(error);
        }
    });

    /** **********************************************************************************************************
       *editSchool: GET loads page to edit existing school
       * Param : SchoolID, id of school to load
       * TODO: userID to make sure user has permission to modify said school
       ************************************************************************************************************ */
    router.get('/edit/:id', utils.isAuthenticated, (req, res) => {
        schools.findSchoolById(req.params.id, (school) => {
            provincesController.getAllProvinces((provinces) => {
                citiesController.getProvinceCitiesByCode(school.province.code, (cities) => {
                    companiesController.getAllCompanies((companies) => {
                        res.render('school/editschool', {
                            school,
                            user: req.user,
                            reviews,
                            provinces,
                            cities,
                            companies,
                            jadefunctions,
                            pictureInfo: pictureinfo,
                            scripts: [scripts.util, scripts.fileUploader, scripts.libtinyMCE, scripts.tinyMCE]
                        });
                    });
                });
            });
        });
    });

    router.post('/edit', (req, res, next) => {
        schools.editSchool(req.body, (error, editedSchool) => {
            if (error) {
                next(error);
            }

            res.redirect(`/school/${editedSchool._id}`);
        });
    });

    /** **********************************************************************************************************
       *getSchoolById : Method to search for specific school by its ID. will return school and render page.
       * ID: school's id.
       ************************************************************************************************************ */
    router.get('/:id', async (req, res, next) => {

        try {
            let school = await schools.findSchoolById(req.params.id);
            let popularCities = await citiesController.getMostPopularCities();
            let popularProvinces = await provincesController.getMostPopularProvinces();

            school.reviews = jadefunctions.trunkContentArray(school.reviews, 'comment', 190);
            school.splitDescription = await jadefunctions.splitDescription(school.description, 600);
            school.description = jadefunctions.nl2br(school.description, false);
            let splashReview = reviews.selectSplashReview(school.reviews);

            let schoolOwner = false;
            if ((req.user && school && school.user && school.user.equals(req.user._id))) {
                schoolOwner = true;
            }
            const reviewDistribution = reviews.createReviewDistribution(school.reviews);

            res.render('school/school', {
                title: `${school.name} - Second Language World`,
                edit: schoolOwner,
                school,
                user: req.user,
                reviewDistribution,
                splashReview,
                criteria,
                moment,
                criteriaScore: school.criteria,
                jadefunctions,
                popularCities,
                popularProvinces,
                pictureInfo: pictureinfo,
                scripts: [scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolPage]
            });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
