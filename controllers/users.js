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

    updateUser : function(user, callback){

        //Replace undefined values by empty strings
        if(user.address == undefined)
            user.address = "";
        if(user.gender == undefined)
            user.gender = "";

        User.findOneAndUpdate({_id:user.id}, {
                username:user.username,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                gender:user.gender,
                address:user.address,
                avatarUrl: user.avatarUrl
        }, function(err, editedUser){
            if(err){
                console.log(err)
            }
            else{
            callback(editedUser);
            }
        });
    }
}

