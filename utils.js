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
  isAuthenticated: function(req, res, next) {
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
  isAdmin: function(req, res, next) {
    if (req.user && req.user.admin) {
      req.admin = req.user.admin;
    } else {
      req.admin = false;
    }
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
  },

  validateQuery: function(queryElement) {
    if (queryElement == undefined || queryElement == 'undefined' || queryElement == '' || queryElement == 'null' || queryElement == null) {
      return -1;
    }
    return queryElement;
  }

};
