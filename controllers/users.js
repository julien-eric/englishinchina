/**
 * Created by Julz on 11/20/2015.
 */
var User = require('./../models/user');

module.exports = {

    findUserById : function(id, callback){
        User.findOne({_id:id}).exec(function(err,user){
            callback(user);
        });
    },

    updateUser : function(req, callback){
        User.findOneAndUpdate({_id:req.body.id}, {
                username:req.body.username,
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                email:req.body.email,
                gender:req.body.gender,
                address:req.body.address,
                avatarUrl: req.body.avatarUrl
        }, function(err, editedUser){
            callback(err, editedUser);
        });
    }
}

