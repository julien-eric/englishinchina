const express = require('express');
const winstonWrapper = require('./config/winstonconfig');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('express-flash-2');
const mongoose = require('mongoose');
const stylus = require('stylus');
const sassMiddleware = require('node-sass-middleware');
const utils = require('./utils');
const favicon = require('serve-favicon');
const settings = require('simplesettings');
const fcbAppId = settings.get('FCB_APP_ID');
const gmapsKey = settings.get('GMAPS_API_KEY');
const environment = settings.get('ENV');
const jobCrawler = require('./jobCrawler/jobCrawler');
let SCSS_DEBUG = true;

mongoose.connect(settings.get('DB_URL'));
const app = express();

// Use compression for faster load times
app.use(compression());

// morgan.token('status', function (req, res) { return res.body.status })
// morgan.token('message', function (req, res) { return res.body.message })
// morgan.token('fruit-name', function (req, res) { return res.body.fruit - name })
// morgan.token('timestamp', function (req, res) { return res.body.timestamp })


// app.use(morgan('Timestamp\: :timestamp fruit-name\: :fruit-name Status\: :status Message\: :message'))

app.use(morgan('dev', { 'stream': winstonWrapper.stream }));

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

// Set variables used in views app-wide
app.locals.fcbAppId = fcbAppId;
app.locals.gmapsKey = gmapsKey;
if (environment == 'production') {
    app.locals.analytics = true;
    SCSS_DEBUG = false;

    const HOURS_BETWEEN_SESSIONS = utils.getRandomArbitrary(2, 3) * 60 * 60 * 1000;
    const SUCCESS_COOLDOWN = utils.getRandomArbitrary(30, 60) * 1000;
    const FAILURE_COOLDOWN = utils.getRandomArbitrary(15, 20) * 1000;
    const INSERTS_PER_SESSION = utils.getRandomArbitrary(2, 4) * 1000;
    jobCrawler.init(null, INSERTS_PER_SESSION, SUCCESS_COOLDOWN, FAILURE_COOLDOWN, HOURS_BETWEEN_SESSIONS);

} else {
    process.on('unhandledRejection', (error, p) => {
        // application specific logging, throwing an error, or other logic here
        winstonWrapper.error('Unhandled Rejection at: Promise', p, 'reason:', error);
        winstonWrapper.error(error.stack);
    });
}

// jobCrawler.init(null, 10, 1000, 1000, 10000);

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
    winstonWrapper.debug('WARNING: SCSS is not recompiling (not debug)');
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
const blogRoutes = require('./routes/blog')(passport);
const reviewRoutes = require('./routes/reviews')(passport);
const jobRoutes = require('./routes/jobs')(passport);
const provinceRoutes = require('./routes/provinces')(passport);

app.use('/', routes);
app.use('/', awsRoutes);
app.use('/school', schoolRoutes);
app.use('/company', companyRoutes);
app.use('/blog', blogRoutes);
app.use('/review', reviewRoutes);
app.use('/job', jobRoutes);
app.use('/province', provinceRoutes);

/** *************************************************************
 catch 404 and forward to error handler
 ************************************************************** */
app.use((error, req, res, next) => {

    // set locals, only providing error in development
    res.locals.message = error.message;
    res.locals.error = app.get('env') === 'development' ? error : {};

    // add this line to include winston logging
    winstonWrapper.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // render the error page
    res.status(error.status || 500);
    res.render('error', {
        message: error.message,
        error: error
    });
});


module.exports = app;
