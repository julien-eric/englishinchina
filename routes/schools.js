const express = require('express');
const moment = require('moment');
const email = require('../controllers/email');

const router = express.Router();
const schools = require('../controllers/schools');
const reviews = require('../controllers/reviews');
const images = require('../controllers/images');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const companiesController = require('../controllers/companies');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const criteria = require('../criteria').criteria;
const async = require('async');
const scripts = require('../scripts').scripts;

/** **********************************************************************************************************
 *isAuthenticated :  If user is authenticated in the session, call the next() to call the next request handler
 Passport adds this method to request object. A middleware is allowed to add properties to
 request and response objects
 ************************************************************************************************************ */
const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/login');
};


module.exports = function (passport) {
  /** ********************************
    //SCHOOL ROUTES
    ********************************** */
  /** **********************************************************************************************************
     *getSchoolById : Method to search for specific school by its ID. will return school and render page.
     * ID: school's id.
     ************************************************************************************************************ */
  router.get('/id/:id', (req, res) => {
    async.waterfall([
      function findSchool(done) {
        schools.findSchoolById(req.params.id, (school) => {
          done(null, school);
        });
      },
      function getPopularCities(school, done) {
        citiesController.getMostPopularCities((popularCities) => {
          done(null, school, popularCities);
        });
      },
      function getPopularProvinces(school, popularCities, done) {
        provincesController.getMostPopularProvinces((popularProvinces) => {
          done(null, school, popularCities, popularProvinces);
        });
      },
      function getRelatedSchools(school, popularCities, popularProvinces, done) {
        if (school.company && school.company.id) {
          schools.findSchoolsByCompanySortbyRating(school.company.id, (err, relatedSchools) => {
            done(err, school, popularCities, popularProvinces, relatedSchools);
          });
        } else {
          done(null, school, popularCities, popularProvinces, null);
        }
      },

      function findNumberOfReviews(school, popularCities, popularProvinces, relatedSchools, done) {
        reviews.findNumberofReviews(school._id, (numberOfReviews) => {
          done(null, school, popularCities, popularProvinces, relatedSchools, numberOfReviews);
        });
      },

      function findReviews(school, popularCities, popularProvinces, relatedSchools, numberOfReviews) {
        reviews.findReviews(school, (reviewList) => {
          // Verify if user has access to school editing.
          let schoolOwner = false;
          if ((req.user && school && school.user && school.user.equals(req.user._id)) || (req.user && req.user.admin)) {
            schoolOwner = true;
          }

          // school.description = jadefunctions.nl2br(school.description, false);
          const reviewDistribution = reviews.createReviewDistribution(reviewList);

          res.render('school/school', {
            title: `${school.name} - English in China`,
            edit: schoolOwner,
            school,
            user: req.user,
            reviewsCount: numberOfReviews,
            reviews: reviewList,
            reviewDistribution,
            criteria,
            moment,
            criteriaScore: school.criteria,
            jadefunctions,
            popularCities,
            popularProvinces,
            relatedSchools,
            pictureInfo: pictureinfo,
            scripts: [scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolpage],
          });
        }, 6, 1, true, req);
      },

    ], (err, callback) => {
      if (err) {
        console.log(err);
      }
    });
  });

  /** **********************************************************************************************************
     *AddSchool : Method for loading page for creating a new school. As well as POST request from website to process creation
     * Param : user, verify user validity and store in DB, to enable editing school
     ************************************************************************************************************ */
  router.route('/addschool')
    .get(isAuthenticated, (req, res) => {
      let incompleteSchool;
      if (req.query.name !== undefined || req.query.schoolType !== undefined) {
        incompleteSchool = { name: decodeURIComponent(req.query.name), schoolType: parseInt(req.query.type) };
      }
      provincesController.getAllProvinces((provinces) => {
        companiesController.getAllCompanies((companies) => {
          res.render('school/addschool', {
            title: 'Add School - English in China',
            user: req.user,
            pictureInfo: pictureinfo,
            provinces,
            companies,
            scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE],
            incompleteSchool,
          });
        });
      });
    })
    .post((req, res) => {
      schools.addSchool(req.user, req.body, (err, newSchool) => {
        if (err) {
          console.log('error');
          return handleError(err);
        }

        // Send Email to admin to advise the creation of a new school
        const message = `Email: ${newSchool.name}\n${newSchool.description}`;
        const callbackMessage = 'Thank you, we will get back to you shortly';
        email.sendEmail('julieneric11@gmail.com', 'newschoolcreated@englishinchina.com', `School Created ${newSchool.name}`, message, callbackMessage, req, () => {
          // redirect the user to its new school
          res.redirect(`/school/id/${newSchool.id}`);
        });
      });
    });

  router.post('/addschoolgetstarted', isAuthenticated, (req, res) => {
    const school = { name: encodeURIComponent(req.body.name), schoolType: encodeURIComponent(req.body.schoolType) };
    res.redirect(`/school/addschool?name=${school.name}&type=${school.schoolType}`);
  });


  /** **********************************************************************************************************
     *Addphoto : Add photo to a school
     * Param : School id
     ************************************************************************************************************ */
  router.get('/addphoto/:id', (req, res) => {
    schools.findSchoolById(req.params.id, (school) => {
      res.render('addphoto', {
        title: 'Upload Picture - English in China',
        school,
        scripts: [scripts.util],
      });
    });
  });

  router.get('/addphotoajax/:id', (req, res) => {
    schools.findSchoolById(req.params.id, (school) => {
      res.render(
        'addphoto', {
          title: 'Upload Picture - English in China',
          school,
        },
        (err, html) => {
          if (err) { console.log(err); } else {
            res.send({ html });
          }
        },
      );
    });
  });

  router.post('/addphoto', (req, res) => {
    const picture = { url: req.body.pictureUrl, description: req.body.description };
    async.waterfall(
      [
      // 1 First find the school
        async.apply((picture, next) => {
          schools.findSchoolById(req.body.id, (school) => {
            next(null, picture, school);
          });
        }, picture),

        // 2 Add Images
        function addImage(picture, school, next) {
          images.addImage(
            {
              type: 1,
              user: req.user,
              school,
              url: picture.url,
              description: picture.description,
              date: Date.now(),
            },
            (error, image) => {
              if (!error) {
                const xschool = school.toObject();
                xschool.photos.push(image);
                schools.updatePictures(xschool, (err, school) => {
                  res.redirect(`/school/id/${school._id}`);
                });
              } else {
                callback(error, createdSchool);
              }
              // next(err, province, city, image);
            },
          );
        },


      ],
      (err, callback) => { },
    );
  });

  router.get('/getphoto/:id', (req, res) => {
    let admin = false;
    if (req.user && req.user.admin) {
      admin = true;
    }
    images.getImageById(req.params.id, (image) => {
      res.render(
        'photomodal', {
          title: 'View Picture - English in China',
          photo: image[0],
          admin,
          pictureInfo: pictureinfo,
        },
        (err, html) => {
          if (err) { res.send({ html: err.toString() }); } else {
            res.send({ html });
          }
        },
      );
    });
  });

  router.get('/deletephoto/:photoid/:schoolid', (req, res) => {
    if (req.user.admin) {
      const photoId = req.params.photoid;
      const schoolId = req.params.schoolid;

      images.deleteImage(photoId, (err, numberOfPhotosDeleted) => {
        res.redirect(`/school/id/${schoolId}`);
      });
    } else {
      req.flash('error', "You don't have administrator rights.");
      return res.redirect('/');
    }
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

  /** ********************************************************************************************************************************
     //REVIEWS
     ********************************************************************************************************************************** */
  /** **********************************************************************************************************
     *WriteReview : Page for users to write review for school specified by id
     * Param : School id
     ************************************************************************************************************ */
  router.get('/id/:id/writereview', isAuthenticated, (req, res) => {
    const schoolId = req.params.id;

    async.waterfall([

      async.apply((schoolId, done) => {
        reviews.findNumberofReviews(schoolId, (numberOfReviews) => {
          done(null, schoolId, numberOfReviews);
        });
      }, schoolId),

      function findReviews(schoolId, numberOfReviews, done) {
        reviews.findReviews(schoolId, (reviewList) => {
          done(null, schoolId, numberOfReviews, reviewList);
        });
      },
      function findSchool(schoolId, numberOfReviews, reviewList) {
        schools.findSchoolById(schoolId, (school) => {
          res.render('writereview', {
            title: `Write Review for ${school.name} - English in China`,
            user: req.user,
            school,
            criteria,
            moment,
            reviewsCount: numberOfReviews,
            reviews: reviewList,
            pictureInfo: pictureinfo,
            jadefunctions,
            scripts: [scripts.util, scripts.libcalendar, scripts.libbsdatetimepicker, scripts.libslider, scripts.writereview],
          });
        });
      },

    ], (err, callback) => {
      if (err) {
        console.log(err);
      }
    });
  });

  /** **********************************************************************************************************
     *insertCommentforSchool : POST insertreview on school
     * userID : integer
     * schoolID : integer
     * review : string
     ************************************************************************************************************ */
  router.post('/insertreview', (req, res) => {
    reviews.insertReviewforSchool(req, (schoolId, averageRating) => {
      schools.findSchoolById(schoolId, (school) => {
        res.redirect(`/school/id/${school._id}`);
      });
    });
  });

  /** **********************************************************************************************************
     *deleteReview : Delete Review
     * userID : integer
     * schoolID : integer
     * review : string
     ************************************************************************************************************ */
  router.get('/deletereview/:reviewid/:schoolid', (req, res) => {
    if (req.user.admin) {
      const reviewId = req.params.reviewid;
      const schoolId = req.params.schoolid;
      reviews.deleteReview(reviewId, (err, document, result) => {
        res.redirect(`/school/id/${schoolId}`);
      });
    } else {
      req.flash('error', "You don't have administrator rights.");
      return res.redirect('/');
    }
  });

  /** **************************************************************************************************************
     * getmorereviews
     ************************************************************************************************************** */
  router.get('/reviews/:schoolid/:page', (req, res) => {
    const page = req.params.page;
    const schoolId = req.params.schoolid;

    reviews.findReviews(schoolId, (reviews) => {
      res.render('school/schoolreviews', {
        title: 'Reviews - English in China',
        reviews,
        pictureInfo: pictureinfo,
        jadefunctions,
        scripts: [scripts.util],
      }, (err, html) => {
        if (err) { console.log(err); } else {
          res.send({ html });
        }
      });
    }, 6, page, true, req);
  });

  /** **************************************************************************************************************
     * get Ajax review
     ************************************************************************************************************** */
  router.get('/reviews/:id', (req, res) => {
    let ajax = false;
    const reviewId = req.params.id;
    const userId = req.user;
    if (req.query.ajax !== undefined) {
      ajax = decodeURIComponent(req.query.ajax);
    }

    reviews.findReviewById(reviewId, userId, (reviewlist) => {
      const review = reviewlist[0];
      review.comment = jadefunctions.nl2br(review.comment, false);

      if (ajax) {
        res.render('school/schoolreview', {
          review,
          loggedin: 'true',
          pictureInfo: pictureinfo,
          jadefunctions,
          scripts: [scripts.util],
          criteria,
          moment,
          criteriaScore: review.criteria,
        }, (err, html) => {
          if (err) { console.log(err); } else {
            res.send({ html });
          }
        });
      } else {
        reviews.findReviews(review.foreignId.id, (otherReviews) => {
          res.render('school/review', {
            title: `${review.foreignId.name} - review by ${review.user.username} - ${review.comment} - English in China`,
            review,
            reviews: otherReviews,
            pictureInfo: pictureinfo,
            jadefunctions,
            scripts: [scripts.util, scripts.libbarchart, scripts.schoolpage],
            criteria,
            moment,
            criteriaScore: review.criteria,
          });
        }, 9, 1, true);
      }
    });
  });

  /** **************************************************************************************************************
     * This review was helpful
     ************************************************************************************************************** */
  router.post('/helpfuls/:type/:id', isAuthenticated, (req, res) => {
    const reviewId = req.params.id;
    const type = req.params.type;
    const userId = req.user;

    async.waterfall(
      [
        async.apply((reviewId, userId, type, done) => {
          reviews.findReviewById(reviewId, userId, (reviewList) => {
            done(null, reviewList[0], userId, type);
          });
        }, reviewId, userId, type),

        function addHelpful(review, userId, type, done) {
          review.helpfuls.push({ user: userId });
          const hf = review.helpfuls[0];
          console.log(hf); // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
          console.log(hf.isNew); // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
          hf.isNew; // true

          review.save((err, document) => {
            // TODO: Change my error handling to this form
            // if (err) return handleError(err)
            // console.log('Success!');
            if (err) {
              res.send({ result: '0' });
            } else {
              // res.send({result:"1", reviewId:documents._id , numberOfHelpfuls:documents.helpfuls.length});
              document.hasHF = true;
              res.render('helpfulshort', {
                review: document,
                loggedin: 'true',
              }, (err, html) => {
                if (err) { console.log(err); } else {
                  res.send({ html, result: '1', reviewId: document.id });
                }
              });
            }
            done(null, document);
          });
        },

        function sendEmailToReviewUser(review) {
          const user = review.user;
          if (user.email != undefined) {
          // var message = "Hi " + review.user.username + "! " + review.helpfuls.length + " people think your review is helpful.\n Take a look : http://englishinchina.co/school/id/" + review.foreignId.id;
            const message = email.createReviewHelpfulMessage(res, review.user.username, review.helpfuls.length, review.foreignId.id, (message) => {
              const callbackMessage = 'Thank you';
              email.sendEmail(user.email, 'reviews@englishinchina.com', `Review Feedback on ${review.foreignId.name}`, message, callbackMessage, req, () => { });
            });
          }
        },

      ],
      // ERROR MANAGEMENT
      (err, callback) => {
        if (err) {
          console.log(`ERROR${err}`);
        } else {
          done();
        }
      },
    );
  });


  /** **********************************************************************************************************
     *searchSchool : Method for search all schools, it will return any school that has some of the information
     * Param : Query, string that will be looked for as part of the schools name
     * [Province] optional.
     * [City] optional
     ************************************************************************************************************ */
  router.get('/search', (req, res) => {
    const schoolInfo = req.query.schoolInfo;
    const province = req.query.province;
    const city = validateCity(req.query.city);


    async.waterfall([

      // 1) Search for list of schools containing some or all of the info
      async.apply((schoolInfo, province, city, callback) => {
        schools.searchSchools(schoolInfo, province, city, (schoolList, searchMessage) => {
          if (schoolList != undefined && schoolList.length > 0) {
            schoolList = jadefunctions.trunkSchoolDescription(schoolList, 180);
          }
          callback(null, schoolList, searchMessage);
        });
      }, schoolInfo, province, city),
      function getPopularCities(schoolList, searchMessage, done) {
        citiesController.getMostPopularCities((popularCities) => {
          done(null, schoolList, searchMessage, popularCities);
        });
      },
      function getPopularProvinces(schoolList, searchMessage, popularCities, done) {
        provincesController.getMostPopularProvinces((popularProvinces) => {
          done(null, schoolList, searchMessage, popularCities, popularProvinces);
        });
      },
      // 2) Get the provinces and pass along all the returned values
      function getProvinces(schoolList, searchMessage, popularCities, popularProvinces) {
        provincesController.getAllProvinces((provinces) => {
          res.render('search', {
            title: `${searchMessage} Schools - English in China`,
            schools: schoolList,
            user: req.user,
            provinces,
            pictureInfo: pictureinfo,
            popularCities,
            popularProvinces,
            searchMessage: `You searched for ${searchMessage}`,
            jadefunctions,
            scripts: [scripts.librater, scripts.util, scripts.rating],
          });
        });
      },
    ], (err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  var validateCity = function (queryElement) {
    if (queryElement == undefined) { return -1; }
    return queryElement;
  };

  /** **********************************************************************************************************
     *editSchool: GET loads page to edit existing school
     * Param : SchoolID, id of school to load
     * TODO: userID to make sure user has permission to modify said school
     ************************************************************************************************************ */
  router.get('/edit/:id', isAuthenticated, (req, res) => {
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
              scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE],
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

      res.redirect(`/school/id/${editedSchool._id}`);
    });
  });

  /** **********************************************************************************************************
     *  validateSchool: School should be validated before appearing in list
     * Param : SchoolID, id of school to validate
     ************************************************************************************************************ */
  router.get('/validate/:id', (req, res) => {
    if (req.user.admin) {
      schools.validateSchool(req.params.id, (err, editedSchool) => {
        res.redirect('/');
      });
    } else {
      return 'nice try';
    }
  });

  /** **********************************************************************************************************
     *  devalidateSchool: Devalidate School
     * Param : SchoolID, id of school to validate
     ************************************************************************************************************ */
  router.get('/invalidate/:id', (req, res) => {
    if (req.user.admin) {
      schools.validateSchool(req.params.id, (err, editedSchool) => {
        res.redirect('/');
      }, false);
    } else {
      return 'nice try';
    }
  });

  /** **********************************************************************************************************
     *  removeSchool: Remove school if user is admin
     * Param : SchoolID, id of school to remove
     ************************************************************************************************************ */
  router.get('/remove/:id', (req, res) => {
    if (req.user.admin) {
      schools.deleteSchool(req.params.id, (err, deletedSchool) => {
        res.redirect('/');
      });
    } else {
      req.flash('error', "You don't have administrator rights.");
      return res.redirect('/');
    }
  });

  return router;
};
