const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const stylus = require('stylus');
const sassMiddleware = require('node-sass-middleware');
const favicon = require('serve-favicon');
const flash = require('express-flash');
const settings = require('simplesettings');
const fcbAppId = settings.get('FCB_APP_ID');
const environment = settings.get('ENV');
const SCSS_DEBUG = true;

mongoose.connect(settings.get('DB_URL'));
const app = express();

// let jobCrawler = require('./jobCrawler/jobCrawler');
// jobCrawler.init('http://www.eslcafe.com/jobs/china/');

/**
 * Used by stylus
 * @param {*} str String
 * @param {*} path Path
 * @return {*} Return function
 */
function compile(str, path) {
  return stylus(str)
    .set('filename', path);
}

// Set variables used in views app-wide
app.locals.fcbAppId = fcbAppId;
if (environment == 'production') {
  app.locals.analytics = true;
} else {
  process.on('unhandledRejection', (error, p) => {
    // application specific logging, throwing an error, or other logic here
    console.log('Unhandled Rejection at: Promise', p, 'reason:', error);
    console.log(error.stack);
  });
}
// let checkAdmin = function(req, res, next) {
//   if (req.user && req.user.admin) {
//     res.locals.admin = req.user.admin;
//   } else {
//     res.locals.admin = false;
//   }
//   next();
// };


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(`${__dirname}/public/favicon.ico`));
// app.use(checkAdmin);

app.use(stylus.middleware({
  src: `${__dirname}/public`,
  compile
}));

const src = path.join(__dirname, 'public', 'scss');
const dst = path.join(__dirname, 'public', 'stylesheets');

if (!SCSS_DEBUG) {
  console.log('WARNING: SCSS is not recompiling (not debug)');
}

app.use(sassMiddleware({
  /* Options */
  src: src,
  dest: dst,
  debug: SCSS_DEBUG,
  outputStyle: 'compressed',
  // indentedSyntax: true, // Add this to use SASS files
  prefix: '/stylesheets'// Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
const passport = require('passport');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

app.use(expressSession({
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {expires: new Date(Date.now() + (30 * 86400 * 1000))},
  secret: 'mySecretKey',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// app.use(function(req, res, next){
//    res.locals.success_messages = req.flash('success_messages');
//    res.locals.error_messages = req.flash('error_messages');
//    next();
// });

/** *************************************************************
 * Using the flash middleware provided by connect-flash to store messages in session
 * and displaying in templates
 ************************************************************** */
// Initialize Passport
const initPassport = require('./passport/init');

initPassport(passport);

/** *************************************************************
 * ROUTES, currently only has main routes and school's
 * @type {router|exports}
 ************************************************************** */
const routes = require('./routes/index')(passport);
const awsRoutes = require('./routes/aws')(passport);
const schoolRoutes = require('./routes/schools')(passport);
const companyRoutes = require('./routes/companies')(passport);
const articleRoutes = require('./routes/articles')(passport);
const reviewRoutes = require('./routes/reviews')(passport);
const jobRoutes = require('./routes/jobs')(passport);

app.use('/', routes);
app.use('/', awsRoutes);
app.use('/school', schoolRoutes);
app.use('/company', companyRoutes);
app.use('/article', articleRoutes);
app.use('/review', reviewRoutes);
app.use('/job', jobRoutes);

/** *************************************************************
 catch 404 and forward to error handler
 ************************************************************** */
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

/** **********************************************
*INIT Provinces
 *********************************************** */
// provincesController.initProvinces(provinces.provinces);

module.exports = app;
