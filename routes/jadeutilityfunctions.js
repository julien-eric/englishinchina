const striptags = require('striptags');


module.exports = {

  trunkContentArray(array, attribute, length) {
    array.forEach((element) => {
      if (length > element[attribute].length) {
        length = element[attribute].length;
      }
      let content = element[attribute];
      content = striptags(content);
      content = content.substring(0, length);
      element[attribute] = `${content.substring(0, content.lastIndexOf(' '))}...`;
    });
    return array;
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
   * Return Average
   */
  returnAverage(array, attribute) {
    let sum = 0;
    let length = 0;
    array.forEach((element) => {
      if (element[attribute] != -1) {
        sum += element[attribute];
        length += 1;
      }
    });
    return sum / length;
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
  }


};
