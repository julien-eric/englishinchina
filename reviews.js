/**
 * Created by Julz on 11/28/2015.
 */
var Review = require('./models/review');

var calculateAverage= function(review){
    return (Number(review.cri_academicDisciplinarySupport) +
        Number(review.cri_accomodationProvided) +
        Number(review.cri_managementAdministration) +
        Number(review.cri_pollution) +
        Number(review.cri_resourcesAvailability) +
        Number(review.cri_respectForContract) +
        Number(review.cri_salaryVsCOLiving) +
        Number(review.cri_supportOnArrivalandVisa))/8;
}

module.exports = {

    insertReviewforSchool: function(req, callback){


        var onReturn = function (err, object){
            if (err) {
                return handleError(err);
            }
            var averageRating = calculateAverage(req.body);
            callback(req.body.school,averageRating);

        };

        Review.create({
            user: req.user._id,
            objectType:0,
            foreignId:req.body.school,
            comment:req.body.comment,
            cri_academicDisciplinarySupport:req.body.cri_academicDisciplinarySupport,
            cri_managementAdministration:req.body.cri_managementAdministration,
            cri_resourcesAvailability:req.body.cri_resourcesAvailability,
            cri_accomodationProvided:req.body.cri_accomodationProvided,
            cri_supportOnArrivalandVisa:req.body.cri_supportOnArrivalandVisa,
            cri_salaryVsCOLiving:req.body.cri_salaryVsCOLiving,
            cri_respectForContract:req.body.cri_respectForContract,
            cri_pollution:req.body.cri_pollution,
            average_rating: calculateAverage(req.body)
            },onReturn);


    },


    findReviews : function(schoolId, callback){
        Review.find({objectType:0, foreignId:schoolId}).populate("user").exec(function(err,comments){
            callback(comments);
        });
    },

    findNumberofReviews : function(schoolId,callback){
        Review.find({objectType:0, foreignId:schoolId}).exec(function(err,comments){
            callback(comments.length);
        });
    }

}
