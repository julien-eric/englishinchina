const express = require('express');
const moment = require('moment');
const email = require('../controllers/email');

const router = express.Router();
const schools = require('../controllers/schools');
const reviews = require('../controllers/reviews');
const images = require('../controllers/images');
const usersController = require('../controllers/users');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const companiesController = require('../controllers/companies');
const jadefunctions = require('../jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const criteria = require('../criteria').criteria;
const scripts = require('../public/scripts');
const utils = require('../utils');

module.exports = function(passport) {
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
          incompleteSchool = {name: decodeURIComponent(req.query.name), schoolType: parseInt(req.query.type)};
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
          scripts: [scripts.util, scripts.typeahead, scripts.typeaheadwrapper, scripts.libtinyMCE, scripts.tinyMCE]
        });
      } catch (error) {
        res.render('error', {
          message: error.message,
          error: error
        });
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

  router.post('/addschoolgetstarted', utils.isAuthenticated, (req, res) => {
    const school = {name: encodeURIComponent(req.body.name), schoolType: encodeURIComponent(req.body.schoolType)};
    res.redirect(`/school/addschool?name=${school.name}&type=${school.schoolType}`);
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
      scripts: [scripts.util]
    });
  });

  router.get('/addphotoajax/:id', async (req, res) => {
    let school = schools.findSchoolById(req.params.id);
    res.render(
      'addphoto', {
        title: 'Upload Picture - Second Language World',
        school
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

  router.post('/addphoto', async (req, res) => {
    const picture = {url: req.body.pictureUrl, description: req.body.description};
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
    const xschool = school.toObject();
    xschool.photos.push(image);
    await schools.updatePictures(xschool);
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
            res.send({html: err.toString()});
          } else {
            res.send({html});
          }
        },
      );
    });
  });

  router.get('/deletephoto/:photoid/:schoolid', utils.isAdmin, (req, res) => {
    const photoId = req.params.photoid;
    const schoolId = req.params.schoolid;

    images.deleteImage(photoId, (err, numberOfPhotosDeleted) => {
      res.redirect(`/school/${schoolId}`);
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

  /** **********************************************************************************************************
     *deleteReview : Delete Review
     * userID : integer
     * schoolID : integer
     * review : string
     ************************************************************************************************************ */
  router.get('/deletereview/:reviewid/:schoolid', utils.isAdmin, (req, res) => {
    const reviewId = req.params.reviewid;
    const schoolId = req.params.schoolid;
    reviews.deleteReview(reviewId, (err, document, result) => {
      res.redirect(`/school/${schoolId}`);
    });
  });

  /** **************************************************************************************************************
     * getmorereviews
     ************************************************************************************************************** */
  router.get('/reviews/:schoolid/:page', async (req, res) => {
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
      res.render('error', {
        message: error.message,
        error: error
      });
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
      }, (err, html) => {
        if (err) {
          console.log(err);
        } else {
          res.send({html});
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
          scripts: [scripts.util, scripts.libbarchart, scripts.schoolpage],
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
  router.post('/helpfuls/:type/:id', utils.isAuthenticated, async (req, res) => {

    try {

      const reviewId = req.params.id;
      const userId = await usersController.findUserById(req.user._id);
      let review = await reviews.findReviewById(reviewId, userId);

      // Update Review to account for new helpful
      let updatedReview = undefined;
      if (!review.hasHF) {
        updatedReview = await reviews.addHelpful(review, {user: userId});
        updatedReview.hasHF = true;
      } else {
        updatedReview = await reviews.removeHelpful(review, {user: userId});
        updatedReview.hasHF = false;
      }

      res.render('helpfulshort', {
        review: updatedReview,
        loggedin: 'true'
      }, (err, html) => {
        if (err) {
          console.log(err);
        } else {
          res.send({html, result: '1', reviewId: updatedReview.id});
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
            () => {});
        });
      }
    } catch (error) {
      console.log(error);
    }

  });


  /** **********************************************************************************************************
     *searchSchool : Method for search all schools, it will return any school that has some of the information
     * Param : Query, string that will be looked for as part of the schools name
     * [Province] optional.
     * [City] optional
     ************************************************************************************************************ */
  router.get('/search/', async (req, res) => {

    try {
      const schoolInfo = req.query.schoolInfo;
      const province = utils.validateQuery(req.query.province);
      const city = utils.validateQuery(req.query.city);

      let searchResults = await schools.searchSchools(schoolInfo, province, city);
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
        cities = await citiesController.getCitiesByProvince(province);
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
      res.render('error', {
        message: error.message,
        error: error
      });
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
      const schoolInfo = req.query.schoolInfo || undefined;
      const province = utils.validateQuery(req.query.province);
      const city = utils.validateQuery(req.query.city);
      let searchResults = await schools.searchSchools(schoolInfo, province, city);
      res.send(JSON.stringify(searchResults.list));
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
        citiesController.getCitiesByProvince(school.province.code, (cities) => {
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
              scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE]
            });
          });
        });
      });
    });
  });

  router.post('/edit', (req, res) => {
    schools.editSchool(req.body, (err, editedSchool) => {
      if (err) {
        console.log('error');
        return handleError(err);
      }

      res.redirect(`/school/${editedSchool._id}`);
    });
  });

  /** **********************************************************************************************************
     *  validateSchool: School should be validated before appearing in list
     * Param : SchoolID, id of school to validate
     ************************************************************************************************************ */
  router.get('/validate/:id', utils.isAdmin, (req, res) => {
    schools.validateSchool(req.params.id, (err, editedSchool) => {
      res.redirect('/');
    });
  });

  /** **********************************************************************************************************
     *  devalidateSchool: Devalidate School
     * Param : SchoolID, id of school to validate
     ************************************************************************************************************ */
  router.get('/invalidate/:id', utils.isAdmin, (req, res) => {
    schools.validateSchool(req.params.id, (err, editedSchool) => {
      res.redirect('/');
    }, false);
  });

  /** **********************************************************************************************************
     *  removeSchool: Remove school if user is admin
     * Param : SchoolID, id of school to remove
     ************************************************************************************************************ */
  router.get('/remove/:id', utils.isAdmin, (req, res) => {
    schools.deleteSchool(req.params.id, (err, deletedSchool) => {
      res.redirect('/');
    });
  });

  /** **********************************************************************************************************
     *getSchoolById : Method to search for specific school by its ID. will return school and render page.
     * ID: school's id.
     ************************************************************************************************************ */
  router.get('/:id', async (req, res) => {

    try {
      let school = await schools.findSchoolById(req.params.id);
      let popularCities = await citiesController.getMostPopularCities();
      let popularProvinces = await provincesController.getMostPopularProvinces();

      school.reviews = jadefunctions.trunkContentArray(school.reviews, 'comment', 190);
      school.splitDescription = await jadefunctions.splitDescription(school.description, 600);
      let splashReview = reviews.selectSplashReview(school.reviews);

      let schoolOwner = false;
      if ((req.user && school && school.user && school.user.equals(req.user._id)) || (res.locals.admin)) {
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
        scripts: [scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolpage]
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
