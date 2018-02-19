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

const checkUserForHelpful = function(reviews, userId) {
  reviews.forEach((review) => {
    review.helpfuls.forEach((helpful) => {
      if (helpful.user.id == userId) {
        review.hasHF = true;
      }
    });
  });
};

module.exports = {


  insertReviewforSchool(req) {

    return Review.create({
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
    });

  },

  async findReviews(schoolId, pageSize, page, populate, userId) {

    let findReviewsQuery = Review.find({objectType: 0, foreignId: schoolId});
    if (pageSize && page) {
      findReviewsQuery.limit(pageSize).skip(pageSize * (page - 1));
    }
    if (populate) {
      findReviewsQuery.populate('user');
    }
    let reviews = await findReviewsQuery.exec();
    if (reviews.length > 0 && userId) {
      checkUserForHelpful(reviews, userId);
    }
    return Promise.resolve(reviews);

  },

  deleteReview(reviewId) {
    return Review.find({_id: reviewId}).remove();
  },

  findNumberofReviews(schoolId) {
    return Review.count({objectType: 0, foreignId: schoolId}).exec();
  },

  findReviewsByUser(userId) {
    return Review.find({objectType: 0, user: userId}).populate('user').populate('school').exec();
  },

  async findReviewById(reviewId, userId) {
    let reviews = await Review.find({_id: reviewId}).populate('user').populate('foreignId').exec();
    checkUserForHelpful(reviews, userId);
    return Promise.resolve(reviews);
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
