module.exports = {

    returnFacebookPicture : function(file){
        return "https://englishinchinaasia.s3.amazonaws.com/" + module.exports.THUMBNAIL + file;
    },

    returnThumbnail : function(file){
        if(file == undefined){
            return "/images/default-user.png";
        }
        return "https://englishinchinaasia.s3.amazonaws.com/" + module.exports.THUMBNAIL + file;
    },

    returnLarge : function(file){
        return "https://englishinchinaasia.s3.amazonaws.com/" + module.exports.LARGE + file;
    },

    trunkFileName : function(file){
        return "https://englishinchinaasia.s3.amazonaws.com/" + module.exports.LARGE + file;
    },

    THUMBNAIL : "th_",
    THUMBNAIL_SIZE: 350,
    FACEBOOK :"",
    LARGE : "lg_",
    LARGE_SIZE : 1663
}