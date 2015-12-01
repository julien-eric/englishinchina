/**
 * Created by Julz on 11/20/2015.
 */
var User = require('./models/user');

module.exports = {

    findUserById : function(id, callback){
        User.findOne({_id:id}).exec(function(err,user){
            callback(user);
        });
    }
}

