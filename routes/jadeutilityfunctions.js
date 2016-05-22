module.exports = {

    /************************************************************************************************************
     *trunkSchoolDescription : Shorter Description for lists that do not require full description.
     * schoolList: Array of schools to truncate
     *************************************************************************************************************/
    trunkSchoolDescription : function(schoolList, length){
        schoolList.forEach(function(school){
            if(length > school.description.length){
                length = school.description.length;
            }
            var description = school.description.substring(0,length);
            description = description.substring(0, description.lastIndexOf(" ")) + "...";
            school.description = description;
        });
        return schoolList;
    },

    trunkSchoolReviews: function(reviews, length){
        reviews.forEach(function(review){
            if(length > review.comment.length){
                length = review.comment.length;
            }
            var comment = review.comment.substring(0,length);
            comment = comment.substring(0, comment.lastIndexOf(" ")) + "...";
            review.comment = comment;
        });
        return reviews;
    },

    returnNameforProvinceCode: function(code){
        switch(code){
            case 0:
                return "Training School"
            case 1:
                return "Public School"
            case 2:
                return "Contractual Training School"

        }

    },

    /************************************************************************************************************
     *roundToPoint5 : Round to closest .5 for school ratings..
     *************************************************************************************************************/
    roundToPoint5 : function(rating){
        return (Math.round(rating*2))/2
    },

    /************************************************************************************************************
     *scale in 4 : Round to closest .5 for school ratings..
     *************************************************************************************************************/
    scale1to4 : function(number){
        return ((number/5)*4)+1
    },

    /************************************************************************************************************
     *capitalize: Capitalize first letter of a string
     *************************************************************************************************************/
    capitalize : function (str) {
        var strVal = '';
        str = str.split(' ');
        for (var chr = 0; chr < str.length; chr++) {
            strVal += str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length) + ' '
        }
        return strVal
    },

    nl2br : function(str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : "<br>"; // Adjust comment to avoid issue on phpjs.org display
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }


}
