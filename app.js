var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dbConfig = require('./database');
var mongoose = require('mongoose');
var stylus = require('stylus');
var provinces = require('./provinces');
var schools = require('./controllers/schools');
var email = require('./controllers/email');
var provincesController = require('./controllers/provinces');
var citiesController = require('./controllers/cities');
var favicon = require('serve-favicon');
var flash = require('express-flash');






// Connect to DB
//mongoose.connect(dbConfig.urldev,function(){
//  /* Drop the DB */
//    mongoose.connection.db.dropDatabase();
//    //mongoose.connection.db.dropCollection('Province', function(err, result) {});
//});
// Reset DB
mongoose.connect(dbConfig.url);


//AWS TO BE SET IN HEROKU NEVER IN APP ITSELF
var AWS_ACCESS_KEY = process.env.S3_KEY;
var AWS_SECRET_KEY = process.env.S3_SECRET;
var S3_BUCKET = process.env.S3_BUCKET;

var app = express();

//REMOVE THIS AND RUN FROM BIN
//var debug = require('debug')('passport-mongo');
//app.set('port', process.env.PORT || 3000);
//var server = app.listen(app.get('port'), function() {
//  debug('Express server listening on port ' + server.address().port);
//});
//////////////////////////////

function compile(str, path) {
  return stylus(str)
      .set('filename', path)
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(stylus.middleware(
    { src: __dirname + '/public'
      , compile: compile
    }
));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({
    cookie: { maxAge: 60* 60000 },
    secret: 'mySecretKey',
    saveUninitialized: true,
    resave: true}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//app.use(function(req, res, next){
//    res.locals.success_messages = req.flash('success_messages');
//    res.locals.error_messages = req.flash('error_messages');
//    next();
//});

/***************************************************************
 * Using the flash middleware provided by connect-flash to store messages in session
 * and displaying in templates
 ***************************************************************/
// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);


/***************************************************************
 * ROUTES, currently only has main routes and school's
 * @type {router|exports}
 ***************************************************************/
var routes = require('./routes/index')(passport);
var schoolRoutes = require('./routes/schools')(passport);
var functionRoutes = require('./routes/function')(passport);
app.use('/', routes);
app.use('/school', schoolRoutes);
app.use('/function', functionRoutes);


/***************************************************************
 catch 404 and forward to error handler
 ***************************************************************/
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

/************************************************
*INIT Provinces
 ************************************************/
//provincesController.initProvinces(provinces.provinces);

module.exports = app;