const striptags = require('striptags');
const htmlparser = require('htmlparser');
const parsedToHtml = require('htmlparser-to-html');
const winston = require('./config/winstonconfig');
const pictureInfo = require('./pictureinfo');
const _ = require('underscore');

module.exports = {

    formatString (string, length) {
        if (string.length > length) {
            return string.toLowerCase().substring(0, length) + '...';
        } else {
            return string.toLowerCase();
        }
    },

    trunkContentArray (array, attribute, length) {
        array.forEach((element) => {
            if (element[attribute].length != 0) {
                if (length < element[attribute].length) {
                    let content = element[attribute];
                    content = striptags(content);
                    content = content.substring(0, length);
                    element[attribute] = `${content.substring(0, content.lastIndexOf(' '))}...`;
                }
            }
        });
        return array;
    },

    trunkContentElement (element, attribute, length) {
        if (element[attribute].length != 0) {
            if (length < element[attribute].length) {
                let content = element[attribute];
                content = striptags(content);
                content = content.substring(0, length);
                element[attribute] = `${content.substring(0, content.lastIndexOf(' '))}...`;
            }
        }
        return element;
    },

    returnNameforSchoolType (code) {
        switch (code) {
            case 0:
                return 'Training School';
            case 1:
                return 'Public School';
            case 2:
                return 'Cont.Training School';
        }
    },

    splitString (str, char) {
        return str.split(char);
    },

    splitDescription (description, length) {

        return new Promise(function (resolve, reject) {

            if (length > description.length) {
                return resolve(undefined);
            }

            let handle = function (error, dom) {
                if (error) {
                    winston.error(`${error.status || 500} - ${error.message}`);
                } else {
                    handleDom(dom);
                }
            };

            let handleDom = function (dom) {

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
    returnAverage (array, attribute) {
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
    roundToPoint5 (rating) {
        let number = (Math.round(rating * 2)) / 2;
        return number.toFixed(1);
    },

    /**
     *roundToPoint5 : Round to specified number of decimal places for any number.
     * @param {*} value number to be rounded
     * @param {Number} precision Number of decimals to use
     * @return {number}
     */
    roundToDecimalPlace (value, precision) {
        let multiplier = Math.pow(10, precision || 0);
        return (Math.round(value * multiplier) / multiplier).toFixed(precision || 0);
    },

    /**
     * *scale in 4 : Round to closest .5 for school ratings.
     * @param {*} unscaled Number to scale
     * @return {number} Scaled number
     */
    scale1to4 (unscaled) {
        let number = ((unscaled / 5) * 4) + 1;
        return number.toFixed(1);
    },

    /**
     * @param {*} str String to be capitalized
     * @return {String} Capitalized string
     */
    capitalize (str) {
        let strVal = '';
        str = str.split(' ');
        for (let chr = 0; chr < str.length; chr++) {
            strVal += `${str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length)} `;
        }
        return strVal;
    },

    nl2br (str, isXhtml) {
        // Adjust comment to avoid issue on phpjs.org display
        const breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br ' + '/>' : '<br>';
        // str = str.replace("\r\n", "\n").replace("\r", "\n")
        return (`${str}`).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${breakTag}$2`);
    },

    returnImageForUser (user) {
        if (user) {
            if (user.fb && user.useFacebookPic) {
                return pictureInfo.returnFacebookPicture(user.avatarUrl);
            } else if (user.avatarUrl == '/public/default.png') {
                return '/images/default-user.png';
            } else {
                return pictureInfo.returnThumbnail(user.avatarUrl);
            }
        } else {
            return '/images/default-user.png';
        }
    },

    ratingColor (rating, bgOrText) {
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
    },

    returnAccomodationTerm (code) {
        switch (code) {
            case 0:
                return 'No Accomodation';
            case 1:
                return 'Accomodation Provided';
            case 2:
                return 'Accomodation Partly Provided';

            default:
                break;
        }
    },

    returnSalary (number) {
        return Math.round(Number(number) / 1000) + 'K';
    }

};
