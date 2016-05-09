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

    findUserByEmail : function(email, callback){
        User.findOne({email:email}).exec(function(err,user){
            callback(err,user);
        });
    },

    findUserByToken : function(token, expiryDate, callback){
        User.findOne({resetPasswordToken:token, resetPasswordExpires:expiryDate}).exec(function(err,user){
            callback(err,user);
        });
    },

    updateUser : function(user, callback){
        var useFacebookPic = false;

        //Replace undefined values by empty strings
        if(user.address == undefined)
            user.address = "";
        if(user.gender == undefined)
            user.gender = "";
        if(user.username == "admin"){
            user.admin = true;
        }
        if(user.avatarUrl.indexOf("englishinchina") == -1){
            useFacebookPic = true;
        }

        else{user.admin=false;}

        User.findOneAndUpdate({_id:user.id}, {
                username:user.username,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                gender:user.gender,
                address:user.address,
                admin:user.admin,
                useFacebookPic:useFacebookPic,
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

