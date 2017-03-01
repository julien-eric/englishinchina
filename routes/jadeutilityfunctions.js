var striptags = require("striptags");


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
            var description = school.description;
            description = striptags(description);
            description = description.substring(0,length);
            school.description = description.substring(0, description.lastIndexOf(" ")) + "...";
        });
        return schoolList;
    },

    trunkArticlesContent : function(articles, length){
        articles.forEach(function(article){
            if(length > article.content.length){
                length = article.content.length;
            }
            var content = article.content;
            content = striptags(content);
            content = content.substring(0,length);
            article.content = content.substring(0, content.lastIndexOf(" ")) + "...";
        });
        return articles;
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

    returnNameforSchoolType: function(code){
        switch(code){
            case 0:
                return "Training School"
            case 1:
                return "Public School"
            case 2:
                return "Cont.Training School"

        }

    },

    /************************************************************************************************************
     *roundToPoint5 : Round to closest .5 for school ratings..
     *************************************************************************************************************/
    roundToPoint5 : function(rating){
        var number = (Math.round(rating*2))/2;
        return number.toFixed(1);
    },

    /************************************************************************************************************
     *scale in 4 : Round to closest .5 for school ratings..
     *************************************************************************************************************/
    scale1to4 : function(number){
        var number =  ((number/5)*4)+1
        return number.toFixed(1);
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
        //str = str.replace("\r\n", "\n").replace("\r", "\n")
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }


}
