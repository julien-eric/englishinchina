const striptags = require('striptags');
const htmlparser = require('htmlparser');
const parsedToHtml = require('htmlparser-to-html');
const _ = require('underscore');

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

  splitDescription(description, length) {

    return new Promise(function(resolve, reject) {

      if (length > description.length) {
        return resolve(undefined);
      }

      let handle = function(error, dom) {
        if (error) {
          console.log(error);
        } else {
          handleDom(dom);
        }
      };

      let handleDom = function(dom) {

        let sum = 0;

        if (dom.length <= 1) {
          return resolve(undefined);
        }

        let breakIndex = _.findIndex(dom, (domElement) => {
          let stringHtml = parsedToHtml(domElement);
          sum = sum + stringHtml.length;
          return sum >= length;
        });

        // return breakIndex;
        return resolve({
          short: parsedToHtml(_.first(dom, breakIndex + 1)),
          long: parsedToHtml(_.rest(dom, breakIndex + 1))
        });
      };

      let handler = new htmlparser.DefaultHandler(handle);
      let parser = new htmlparser.Parser(handler);
      parser.parseComplete(description);
    });
  },

  /**
   *returnAverage : Return the average of a single property for an array
   * @param {*} array The array from which to get the property
   * @param {*} attribute The numerial property
   * @return {number}
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
  },

  ratingColor(rating, bgOrText) {
    let colorClass = '';

    if (rating > 3.9) {
      colorClass = 'rating-great';
    } else if (rating > 2.9) {
      colorClass = 'rating-good';
    } else if (rating > 1.9) {
      colorClass = 'rating-medium';
    } else {
      colorClass = 'rating-bad';
    }

    if (bgOrText == 'bg') {
      return 'bg-' + colorClass;
    } else {
      return 'text-' + colorClass;
    }
  }

};
