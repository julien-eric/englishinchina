module.exports = {

    returnFacebookPicture : function(link){
        return link;
    },

    returnThumbnail : function(link){
        if(link == undefined){
            return "/images/default-user.png";
        }
        link = link.replace(/englishinchina/g, "englishinchinaasia")
        var hostname = link.substring(0, link.lastIndexOf('/'));
        var pathname = link.substring(link.lastIndexOf('/'));
        return hostname + "/" + module.exports.THUMBNAIL + pathname.substring(1);
    },

    returnLarge : function(link){
        link = link.replace(/englishinchina/g, "englishinchinaasia")
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