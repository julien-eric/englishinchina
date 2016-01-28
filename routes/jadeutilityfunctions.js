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

    /************************************************************************************************************
     *roundToPoint5 : Round to closest .5 for school ratings..
     *************************************************************************************************************/
    roundToPoint5 : function(rating){
        return (Math.round(rating*2))/2
    }

}
