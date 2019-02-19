const { createLogger, format, transports } = require('winston');
const appRoot = require('app-root-path');

// define the custom settings for each transport (file, console)
let options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false
    },
    console: {
        level: 'silly',
        format: format.combine(
            format.colorize(),
            format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}`
            )
        )
    }
};

// instantiate a new Winston Logger with the settings defined above
let logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => {
            return `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`;
        })
    ),

    transports: [
        new transports.File(options.file),
        new transports.Console(options.console)
    ],
    exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message.slice(0, -1));
    }
};

module.exports = logger;
