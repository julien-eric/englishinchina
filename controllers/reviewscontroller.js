/**
 * Created by Julz on 11/28/2015.
 */
const Review = require('../models/review');
const moment = require('moment');

const calculateAverage = function (review) {
  return (Number(review.c1) +
    Number(review.c2) +
    Number(review.c3) +
    Number(review.c4) +
    Number(review.c5) +
    Number(review.c6) +
    Number(review.c7) +
    Number(review.c8)) / 8;
};

const convertCriteriaToOnFive = function (review) {
  return {
    c1: review.cri_supportOnArrivalandVisa/2,
    c2: review.cri_managementAdministration/2,
    c3: review.cri_resourcesAvailability/2,
    c4: review.cri_accomodationProvided/2,
    c5: review.cri_locationAccesibility/2,
    c6: review.cri_salaryVsCOLiving/2,
    c7: review.cri_respectForContract/2,
    c8: review.cri_dynamicTeachers/2
  };
};

const checkUserForHelpful = function (reviews, userId) {
  if (!reviews.length) {
    reviews = [reviews];
  }

  reviews.forEach((review) => {
    review.helpfuls.forEach((helpful) => {
      if (helpful.user.id.equals(userId)) {
        review.hasHF = true;
      }
    });
  });

  return reviews;
};

module.exports = {


  insertReviewforSchool (req) {

    let user = null;
    if (req.user) {
      user = req.user._id;
    }

    let criteria = convertCriteriaToOnFive(req.body);

    return Review.create({
      user: user,
      objectType: 0,
      foreignId: req.body.schoolId,
      comment: req.body.comment,
      anonymous: req.body.anonymous,
      position: req.body.position,
      dateEmployed: new Date(moment(req.body.dateEmployed, 'MMMM Do YYYY').format()),
      dateReleased: new Date(moment(req.body.dateReleased, 'MMMM Do YYYY').format()),
      criteria: criteria,
      average_rating: calculateAverage(criteria)
    });

  },

  async findReviews (schoolId, pageSize, page, populate, userId) {

    let findReviewsQuery = Review.find({ objectType: 0, foreignId: schoolId });
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

  deleteReview (reviewId) {
    return Review.find({ _id: reviewId }).remove();
  },

  findNumberofReviews (schoolId) {
    return Review.count({ objectType: 0, foreignId: schoolId }).exec();
  },

  findReviewsByUser (userId) {
    return Review.find({ objectType: 0, user: userId }).populate('user').populate('school').exec();
  },

  async findReviewById (reviewId, userId) {
    let reviews = await Review.findOne({ _id: reviewId }).populate('user').populate('foreignId').exec();
    if (userId) {
      reviews = checkUserForHelpful(reviews, userId._id.id);
      return Promise.resolve(reviews[0]);
    } else {
      return Promise.resolve(reviews);
    }
  },

  selectSplashReview (reviews) {
    let splashReview = { average_rating: -1 };
    reviews.forEach((review) => {
      if (review.average_rating > splashReview.average_rating && review.comment) {
        splashReview = review;
      }
    });
    if (splashReview.average_rating == -1) {
      return undefined;
    }
    return splashReview;
  },

  addHelpful (review, helpful) {
    return Review.findOneAndUpdate(
      { _id: review._id },
      { $push: { helpfuls: helpful } }
    ).exec();
  },

  removeHelpful (review, helpful) {
    return Review.findOneAndUpdate(
      { _id: review._id },
      { $pull: { helpfuls: { user: helpful.user._id } } }
    ).exec();
  },

  createReviewDistribution (reviews) {
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
