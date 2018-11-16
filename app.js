const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('express-flash-2');
const mongoose = require('mongoose');
const stylus = require('stylus');
const sassMiddleware = require('node-sass-middleware');
const favicon = require('serve-favicon');
const settings = require('simplesettings');
const fcbAppId = settings.get('FCB_APP_ID');
const environment = settings.get('ENV');
const jobCrawler = require('./jobCrawler/jobCrawler');
const SCSS_DEBUG = false;

mongoose.connect(settings.get('DB_URL'));
const app = express();



/**
 * Used by stylus
 * @param {*} str String
 * @param {*} path Path
 * @return {*} Return function
 */
function compile (str, path) {
    return stylus(str)
        .set('filename', path);
}

let getRandomArbitrary = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
};

// Set variables used in views app-wide
app.locals.fcbAppId = fcbAppId;
if (environment == 'production') {
    app.locals.analytics = true;

    const HOURS_BETWEEN_SESSIONS = getRandomArbitrary(2, 3) * 60 * 60 * 1000;
    const SUCCESS_COOLDOWN = getRandomArbitrary(30, 60) * 1000;
    const FAILURE_COOLDOWN = getRandomArbitrary(5, 10) * 1000;
    const INSERTS_PER_SESSION = getRandomArbitrary(5, 10) * 1000;
    jobCrawler.init(null, INSERTS_PER_SESSION, SUCCESS_COOLDOWN, FAILURE_COOLDOWN, HOURS_BETWEEN_SESSIONS);

} else {
    process.on('unhandledRejection', (error, p) => {
        // application specific logging, throwing an error, or other logic here
        console.log('Unhandled Rejection at: Promise', p, 'reason:', error);
        console.log(error.stack);
    });
}

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
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { expires: new Date(Date.now() + (30 * 86400 * 1000)) },
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

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
const provinceRoutes = require('./routes/provinces')(passport);

app.use('/', routes);
app.use('/', awsRoutes);
app.use('/school', schoolRoutes);
app.use('/company', companyRoutes);
app.use('/article', articleRoutes);
app.use('/review', reviewRoutes);
app.use('/job', jobRoutes);
app.use('/province', provinceRoutes);

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

module.exports = app;
