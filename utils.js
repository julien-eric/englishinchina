module.exports = {
  /**
 * isAuthenticated :  If user is authenticated in the session, call the next() to call the next request handler
 Passport adds this method to request object. A middleware is allowed to add properties to
 request and response objects
 * @param {*} req HTTP Request
 * @param {*} res HTTP Request
 * @param {*} next callback
 * @return {Object} The return of the callback function
 */
  isAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
  },

  /**
  * isAdmin :  If user is admin in the session, call the next() to call the next request handler
  Passport adds this method to request object. A middleware is allowed to add properties to
  request and response objects
  * @param {*} req HTTP Request
  * @param {*} res HTTP Request
  * @param {*} next callback
  */
  isAdmin: function (req, res, next) {
    if (req.user && req.user.admin) {
      req.admin = req.user.admin;
    } else {
      req.admin = false;
    }
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
  },

  validateQuery: function (queryElement) {
    if (queryElement == undefined || queryElement == 'undefined' || queryElement == '' || queryElement == 'null' || queryElement == null) {
      return -1;
    }
    return queryElement;
  },

  getSchoolSortingObject: function (sortingQuery) {
    if (sortingQuery == undefined || sortingQuery == 'undefined' || sortingQuery == '' || sortingQuery == 'null' || sortingQuery == null) {
      return undefined;
    }
    else {
      if (sortingQuery == 'ratingUp') {
        return { attribute: 'averageRating', order: -1 }
      } else if (sortingQuery == 'ratingDown') {
        return { attribute: 'averageRating', order: 1 }
      } else if (sortingQuery == 'alphaUp') {
        return { attribute: 'name', order: 1 }
      } else if (sortingQuery == 'alphaDown') {
        return { attribute: 'name', order: -1 }
      }
    }
    return sortingQuery;
  },


  returnRegex: function (queryInfo) {

    let words = queryInfo.split(' ');

    if (words[words.length - 1] == '') {
      words = _.first(words, words.length - 1);
    }

    if (words.length == 1) {
      return queryInfo;
    }

    let regex = '';
    for (let index = 0; index < words.length; index++) {
      let item = words[index];
      if (index == words.length - 1) {
        regex += item;
      } else {
        regex += item + '|';
      }
    }

    return regex;

  }

};
