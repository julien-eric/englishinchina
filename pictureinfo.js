module.exports = {

    returnFacebookPicture : function(link){
        return link;
    },

    returnThumbnail : function(link){
        var hostname = link.substring(0, link.lastIndexOf('/'));
        var pathname = link.substring(link.lastIndexOf('/'));
        return hostname + "/" + module.exports.THUMBNAIL + pathname.substring(1);
    },

    returnLarge : function(link){
        var hostname = link.substring(0, link.lastIndexOf('/'));
        var pathname = link.substring(link.lastIndexOf('/'));
        return hostname + "/" + module.exports.LARGE + pathname.substring(1);
    },

    THUMBNAIL : "th_",
    THUMBNAIL_SIZE: 350,
    FACEBOOK :"",
    LARGE : "lg_",
    LARGE_SIZE : 1663
}