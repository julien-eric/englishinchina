const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dbConfig = require('./database');
const mongoose = require('mongoose');
const stylus = require('stylus');
const favicon = require('serve-favicon');
const flash = require('express-flash');


// Connect to DB
// mongoose.connect(dbConfig.urldev,function(){
//  /* Drop the DB */
//    mongoose.connection.db.dropDatabase();
//    //mongoose.connection.db.dropCollection('Province', function(err, result) {});
// });
// Reset DB
mongoose.connect(dbConfig.url);


// // AWS TO BE SET IN HEROKU NEVER IN APP ITSELF
// const AWS_ACCESS_KEY = process.env.S3_KEY;
// const AWS_SECRET_KEY = process.env.S3_SECRET;
// const S3_BUCKET = process.env.S3_BUCKET;

const app = express();

// REMOVE THIS AND RUN FROM BIN
// var debug = require('debug')('passport-mongo');
// app.set('port', process.env.PORT || 3000);
// var server = app.listen(app.get('port'), function() {
//  debug('Express server listening on port ' + server.address().port);
// });
// ////////////////////////////

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(`${__dirname}/public/favicon.ico`));

app.use(stylus.middleware({
  src: `${__dirname}/public`,
  compile,
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
  saveUninitialized: true,
}));
// app.use(expressSession({
//    cookie: { maxAge: 100* 60000 },
//    secret: 'mySecretKey',
//    saveUninitialized: true,
//    resave: true}));
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
const schoolRoutes = require('./routes/schools')(passport);
const functionRoutes = require('./routes/function')(passport);

app.use('/', routes);
app.use('/school', schoolRoutes);
app.use('/function', functionRoutes);


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
      error: err,
    });
  });
}

/** **********************************************
*INIT Provinces
 *********************************************** */
// provincesController.initProvinces(provinces.provinces);

module.exports = app;
