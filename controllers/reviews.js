/**
 * Created by Julz on 11/28/2015.
 */
const Review = require('./../models/review');
const moment = require('moment');

const calculateAverage = function(review) {
  return (Number(review.cri_dynamicTeachers) +
        Number(review.cri_accomodationProvided) +
        Number(review.cri_managementAdministration) +
        Number(review.cri_locationAccesibility) +
        Number(review.cri_resourcesAvailability) +
        Number(review.cri_respectForContract) +
        Number(review.cri_salaryVsCOLiving) +
        Number(review.cri_supportOnArrivalandVisa)) / 8;
};

module.exports = {

  insertReviewforSchool(req, callback) {
    const onReturn = function(err, object) {
      if (err) {
        console.log(err);
      } else {
        const averageRating = calculateAverage(req.body);
        callback(req.body.school, averageRating);
      }
    };

    Review.create({
      user: req.user._id,
      objectType: 0,
      foreignId: req.body.school,
      comment: req.body.comment,
      anonymous: req.body.anonymous,
      position: req.body.position,
      dateEmployed: new Date(moment(req.body.dateEmployed, 'dddd, MMMM Do YYYY').format()),
      dateReleased: new Date(moment(req.body.dateReleased, 'dddd, MMMM Do YYYY').format()),
      criteria: {
        c1: req.body.cri_supportOnArrivalandVisa,
        c2: req.body.cri_managementAdministration,
        c3: req.body.cri_resourcesAvailability,
        c4: req.body.cri_accomodationProvided,
        c5: req.body.cri_locationAccesibility,
        c6: req.body.cri_salaryVsCOLiving,
        c7: req.body.cri_respectForContract,
        c8: req.body.cri_dynamicTeachers
      },
      average_rating: calculateAverage(req.body)
    }, onReturn);
  },

  findReviews(schoolId, callback, pageSize, page, populate, req) {
    const onReturn = function(err, reviews) {
      if (err) {
        console.log(err);
      } else if (req && req.user) {
        // If this could be done in the fetch from db it would be much better
        reviews.forEach((review) => {
          review.helpfuls.forEach((helpful) => {
            if (helpful.user.id == req.user._id.id) {
              review.hasHF = true;
            }
          });
        });
        callback(reviews);
      } else {
        callback(reviews);
      }
    };
    if (pageSize && page && populate) {
      Review.find({objectType: 0, foreignId: schoolId}).limit(pageSize).skip(pageSize * (page - 1)).populate('user')
        .exec(onReturn);
    } else if (!pageSize && populate) {
      Review.find({objectType: 0, foreignId: schoolId}).populate('user').exec(onReturn);
    } else {
      Review.find({objectType: 0, foreignId: schoolId}).exec(onReturn);
    }
  },

  deleteReview(reviewId, callback) {
    Review.find({_id: reviewId}, (err, review) => {
      review[0].remove(callback);
    });
  },

  findNumberofReviews(schoolId, callback) {
    Review.count({objectType: 0, foreignId: schoolId}).exec((err, numberOfComments) => {
      if (err) {
        console.log(err);
      } else {
        callback(numberOfComments);
      }
    });
  },

  findReviewsByUser(userId, callback) {
    Review.find({objectType: 0, user: userId}).populate('user').populate('school').exec((err, comments) => {
      if (err) {
        console.log(err);
      } else {
        callback(comments);
      }
    });
  },

  findReviewById(reviewId, userId, callback) {
    Review.find({_id: reviewId}).populate('user').populate('foreignId').exec((err, reviews) => {
      if (err) {
        console.log(err);
      } else if (userId) {
        // If this could be done in the fetch from db it would be much better
        reviews.forEach((review) => {
          review.helpfuls.forEach((helpful) => {
            if (helpful.user.id == userId._id.id) {
              review.hasHF = true;
            }
          });
        });
        callback(reviews);
      } else {
        callback(reviews);
      }
    });
  },

  createReviewDistribution(reviews) {
    const distribution = [0, 0, 0, 0, 0];
    for (const i in reviews) {
      const value = reviews[i].average_rating;
      switch (true) {
        case (value < 1.5):
          distribution[0]++;
          break;
        case (value < 2.5):
          distribution[1]++;
          break;
        case (value < 3.5):
          distribution[2]++;
          break;
        case (value < 4.5):
          distribution[3]++;
          break;
        case (value < 5):
          distribution[4]++;
          break;
        default:
          break;
      }
    }
    return distribution;
  }
};
