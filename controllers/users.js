/**
 * Created by Julz on 11/20/2015.
 */
const User = require('./../models/user');

module.exports = {

  getAllUsers(callback) {
    User.find().exec((err, userList) => {
      if (err) {
        console.log(err);
      } else {
        callback(userList);
      }
    });
  },

  findUserById(id, callback) {
    User.findOne({_id: id}).exec((err, user) => {
      callback(user);
    });
  },

  findUserByEmail(email, callback) {
    User.findOne({email}).exec((err, user) => {
      callback(err, user);
    });
  },

  findUserByToken(token, expiryDate, callback) {
    User.findOne({resetPasswordToken: token, resetPasswordExpires: expiryDate}).exec((err, user) => {
      callback(err, user);
    });
  },

  updateUser(user, callback) {
    let useFacebookPic = false;

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
      useFacebookPic = true;
    }

    User.findOneAndUpdate({_id: user.id}, {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      address: user.address,
      admin: user.admin,
      useFacebookPic,
      avatarUrl: user.avatarUrl,
    }, (err, editedUser) => {
      if (err) {
        console.log(err);
      } else {
        callback(editedUser);
      }
    });
  },
};

