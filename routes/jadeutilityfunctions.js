const striptags = require('striptags');


module.exports = {

  /**
   * Shorter Description for lists that do not require full description.
   * @param {*} schoolList  Array of schools to truncate
   * @param {*} length Position at which to truncate
   * @return {string} Truncated List
   */
  trunkSchoolDescription(schoolList, length) {
    schoolList.forEach((school) => {
      if (length > school.description.length) {
        length = school.description.length;
      }
      let description = school.description;
      description = striptags(description);
      description = description.substring(0, length);
      school.description = `${description.substring(0, description.lastIndexOf(' '))}...`;
    });
    return schoolList;
  },

  trunkArticlesContent(articles, length) {
    articles.forEach((article) => {
      if (length > article.content.length) {
        length = article.content.length;
      }
      let content = article.content;
      content = striptags(content);
      content = content.substring(0, length);
      article.content = `${content.substring(0, content.lastIndexOf(' '))}...`;
    });
    return articles;
  },

  trunkSchoolReviews(reviews, length) {
    reviews.forEach((review) => {
      if (length > review.comment.length) {
        length = review.comment.length;
      }
      let comment = review.comment.substring(0, length);
      comment = `${comment.substring(0, comment.lastIndexOf(' '))}...`;
      review.comment = comment;
    });
    return reviews;
  },

  returnNameforSchoolType(code) {
    switch (code) {
      case 0:
        return 'Training School';
      case 1:
        return 'Public School';
      case 2:
        return 'Cont.Training School';
    }
  },

  /**
   *roundToPoint5 : Round to closest .5 for school ratings.
   * @param {*} rating to be rounded
   * @return {number}
   */
  roundToPoint5(rating) {
    let number = (Math.round(rating * 2)) / 2;
    return number.toFixed(1);
  },

  /**
   * *scale in 4 : Round to closest .5 for school ratings.
   * @param {*} unscaled Number to scale
   * @return {number} Scaled number
   */
  scale1to4(unscaled) {
    let number = ((unscaled / 5) * 4) + 1;
    return number.toFixed(1);
  },

  /**
   * @param {*} str String to be capitalized
   * @return {String} Capitalized string
   */
  capitalize(str) {
    let strVal = '';
    str = str.split(' ');
    for (let chr = 0; chr < str.length; chr++) {
      strVal += `${str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length)} `;
    }
    return strVal;
  },

  nl2br(str, isXhtml) {
    // Adjust comment to avoid issue on phpjs.org display
    const breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br ' + '/>' : '<br>';
    // str = str.replace("\r\n", "\n").replace("\r", "\n")
    return (`${str}`).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${breakTag}$2`);
  },


};
