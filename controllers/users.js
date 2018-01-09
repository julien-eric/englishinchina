/**
 * Created by Julz on 11/20/2015.
 */
const User = require('./../models/user');

module.exports = {

  getAllUsers() {
    return User.find().exec();
  },

  findUserById(id) {
    return User.findOne({_id: id}).exec();
  },

  findUserByEmail(email) {
    return User.findOne({email}).exec();
  },

  findUserByToken(token, expiryDate) {
    return User.findOne({resetPasswordToken: token, resetPasswordExpires: expiryDate}).exec();
  },

  updateUser(user) {

    user.useFacebookPic = false;
    // Replace undefined values by empty strings
    if (user.address == undefined) {
      user.address = '';
    }
    if (user.gender == undefined) {
      user.gender = '';
    }
    // if(user.username == "admin"){
    //     user.admin = true;
    // }
    // else{user.admin=false;}
    if (user.avatarUrl.indexOf('englishinchina') == -1) {
      user.useFacebookPic = true;
    }

    return User.findOneAndUpdate({_id: user.id}, user);
  }
};

