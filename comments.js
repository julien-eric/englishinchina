/**
 * Created by Julz on 11/28/2015.
 */
var Comment = require('./models/comment');

module.exports = {

    insertCommentforSchool: function(userId, schoolId, comment, callback){
        Comment.create({ user: userId, objectType:0, foreignId:schoolId, comment:comment }, function (err, callback){
            if (err) {
                console.log("error");
                return handleError(err);
            }
            console.log("success");
        });
    },

    findComments : function(schoolId, callback){
        Comment.find({objectType:0, foreignId:schoolId}).populate("user").exec(function(err,comments){
            callback(comments);
        });
    }

}
