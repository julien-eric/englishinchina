const request = require('request');
const winston = require('../config/winstonconfig');
const moment = require('moment');
const cheerio = require('cheerio');
const URL = require('url-parse');
const _ = require('underscore');
const jobsController = require('../controllers/jobscontroller');
const provincesController = require('../controllers/provincescontroller');
const citiesController = require('../controllers/citiescontroller');
const USDTOCNY = 6.76;
const PNDSTOCNY = 8.69;

let PAGES_TO_VISIT = [
    'https://teflsearch.com/job-results/country/china?page=1',
    'https://teflsearch.com/job-results/country/china?page=2',
    'https://teflsearch.com/job-results/country/china?page=3',
    'https://teflsearch.com/job-results/country/china?page=4',
    'https://teflsearch.com/job-results/country/china?page=5',
    'https://teflsearch.com/job-results/country/china?page=6',
    'https://teflsearch.com/job-results/country/china?page=7'
];

let JobCrawler = function () { };

/**
 * @param {Array} pagesArray If specified, the initial array of urls to crawl
 * @param {Number} jobsPerSession The number of jobs to add in a single "session" of crawling (will wait jobDoneCooldown afterwards)
 * @param {Number} searchAddCooldownSuccess The cooldown time after a successful job insert into the database
 * @param {Number} searchAddCooldownProblem The cooldown time after an unsuccessful job insert into the database
 * @param {Number} jobDoneCooldown The cooldown time when the crawler reaches the jobsPerSession number before starting a new session
 */
JobCrawler.prototype.init = function (pagesArray, jobsPerSession, searchAddCooldownSuccess, searchAddCooldownProblem, jobDoneCooldown) {

    this.JOBS_PER_SESSION = jobsPerSession;
    this.SEARCH_ADD_COOLDOWN_SUCCESS = searchAddCooldownSuccess;
    this.SEARCH_ADD_COOLDOWN_PROBLEM = searchAddCooldownProblem;
    this.JOB_DONE_COOLDOWN = jobDoneCooldown;

    this.pagesToVisit = [];
    this.numJobsAdded = 0;
    this.pagesVisited = {};
    if (pagesArray) {
        this.pagesToVisit = pagesArray;
    } else if (PAGES_TO_VISIT) {
        this.pagesToVisit = PAGES_TO_VISIT;
    }
    this.url = new URL(this.pagesToVisit[0]);
    this.baseUrl = this.url.protocol + '//' + this.url.hostname;
    this.crawl(this.pagesToVisit[0]);
};

JobCrawler.prototype.crawl = function (pageToVisit) {

    if (this.numJobsAdded >= this.JOBS_PER_SESSION) {
        winston.silly('Reached desired number of jobs to add. Waiting ' + this.JOB_DONE_COOLDOWN + 'ms');
        this.numJobsAdded = 0;
        let crawl = _.bind(this.crawl, this);
        setTimeout(crawl, 10000);
        return;
    }
    let nextPage = this.pagesToVisit.pop();
    if (nextPage in this.pagesVisited) {
        // We've already visited this page, so repeat the crawl
        this.crawl();
    } else if (nextPage) {
        // New page we haven't visited
        let visitPage = _.bind(this.visitPage, this, nextPage, this.crawl);
        visitPage();
    } else {
        winston.silly('Initial page and relative links have been crawled');
    }
};

JobCrawler.prototype.visitPage = function (url, callback) {

    // Add page to our set
    this.pagesVisited[url] = true;

    // Make the request
    winston.silly('Visiting page ' + url);

    request(url, async (error, response, body) => {

        let result;
        // Check status code (200 is HTTP OK)
        if (!response || response.statusCode !== 200) {
            winston.silly('Status code is ' + response.statusCode + '. Skipping.');
            callback();
            return;
        }

        // Parse the document body
        let $ = cheerio.load(body);

        if (response.req.path.indexOf('job-advert') != -1) {
            result = await this.fetchInformation($);
        } else {
            this.collectInternalLinks($);
        }

        if (result && result.error) {
            let crawl = _.bind(callback, this);
            setTimeout(crawl, this.SEARCH_ADD_COOLDOWN_PROBLEM);
        } else {
            this.numJobsAdded++;
            winston.silly('Added Job, waiting ' + this.SEARCH_ADD_COOLDOWN_SUCCESS + 'ms');
            let crawl = _.bind(callback, this);
            setTimeout(crawl, this.SEARCH_ADD_COOLDOWN_SUCCESS);
        }

    });
};

JobCrawler.prototype.fetchInformation = async function ($) {

    try {

        let fieldProcessor = new FieldProcessor();

        let jobInfo = { contractDetails: {}, benefits: {}, teachingDetails: {} };
        jobInfo.title = $('.views-second-title').text().trim();
        jobInfo.email = fieldProcessor.extractEmail($('.field-name-field-anon-email .field-items span').attr('data-cfemail'));
        if (!jobInfo.email) {
            jobInfo.email = 'secondlanguageworld@gmail.com';
        }

        let job = await jobsController.getJobByTitle(jobInfo.title);
        if (job) {
            throw new Error('Job already exists in the system');
        }

        jobInfo.description = fieldProcessor.extractDescription($);
        jobInfo.kicker = $('.field-name-field-req-job-description').text().trim().substring(0, 120);
        let location = await fieldProcessor.extractLocation($('.field-name-field-location-in-country .field-items .field-item.even').text().trim());

        if (location && location.city) {
            jobInfo.city = location.city;
            jobInfo.cityCode = location.city.code;
            location.province = location.city.province;
        }

        if (location && location.province) {
            jobInfo.province = location.province;
            jobInfo.provinceCode = location.province.code;
            jobInfo.pictureUrl = await provincesController.getProvincePic(location.city.province.code, true);
            jobInfo.pictureFileName = 'not available';
        } else {
            throw new Error('Location could not be parsed');
        }

        jobInfo.salaryLower = fieldProcessor.extractSalary($('.field-name-field-salary-ranges .field-items .field-item.even').text());
        jobInfo.salaryHigher = fieldProcessor.extractSalary($('.field-name-field-salary-ranges .field-items .field-item.odd').text());
        jobInfo.startDate = fieldProcessor.extractDate($('.field-name-field-start-date .field-items').text().trim(), $('.field-name-field-date-options .field-items').text().trim());
        jobInfo.duration = fieldProcessor.extractDuration($('.field-name-field-contract-length .field-items').text().trim());

        jobInfo.institution = $('.field-name-field-institution .field-items').text().trim();
        jobInfo.weeklyLoad = fieldProcessor.extractWorkload($('.field-name-field-average-working-hours .field-items').text().trim());
        jobInfo.classSize = fieldProcessor.extractClassSize($('.field-name-field-average-class-size .field-items').text().trim());
        jobInfo.ageGroup = fieldProcessor.extractAgeGroup($('.field-name-field-student-age .field-items').text().trim());

        jobInfo.accomodation = fieldProcessor.extractAccomodation($('.field-name-field-accomodation .field-items').text().trim());
        jobInfo.airfare = fieldProcessor.extractAccomodation($('.field-name-field-airfare .field-items').text().trim());
        jobInfo.teachingAssistant = fieldProcessor.extractAssistant($('.field-name-field-assistant .field-items').text().trim());
        jobInfo.vacationDays = Number($('.field-name-field-total-vacation .field-items').text().trim());

        let savedJob = await jobsController.addJob(undefined, jobInfo);
        if (savedJob) {
            winston.silly('ADDED: ' + savedJob.title);
        }
        return { error: null, job: savedJob };

    } catch (error) {

        if (error.error) {
            error = error.error;
        }

        winston.silly(error.message);
        return { error };
    }

};

JobCrawler.prototype.collectInternalLinks = function ($) {

    let that = this;

    let relativeLinks = $('a[href^="/"]');
    winston.silly('Found ' + relativeLinks.length + ' relative links on page');
    relativeLinks.each(function () {
        let href = $(this).attr('href');
        if (href.indexOf('job-advert') != -1) {
            that.pagesToVisit.push(that.baseUrl + $(this).attr('href'));
        }
    });
};

let FieldProcessor = function () { };

FieldProcessor.prototype.extractSalary = function (salaryString) {
    try {
        if (salaryString.indexOf('¥') != -1) {
            return Number(salaryString.replace(/,/g, '').substring(salaryString.indexOf('¥') + 1));
        } else if (salaryString.indexOf('$') != -1) {
            return Math.round(Number(salaryString.replace(/,/g, '').substring(salaryString.indexOf('$') + 1)) * USDTOCNY / 1000) * 1000;
        } else if (salaryString.indexOf('£') != -1) {
            return Math.round(Number(salaryString.replace(/,/g, '').substring(salaryString.indexOf('$') + 1)) * PNDSTOCNY / 1000) * 1000;
        } else {
            return Number(salaryString);
        }
    } catch (error) {
        return new Error(error.message);
    }
};

FieldProcessor.prototype.extractEmail = function (encodedString) {
    try {

        let validateEmail = function (email) {
            return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
        };

        let decodeEmail = function (encodedString) {
            let email = '';
            let r = parseInt(encodedString.substr(0, 2), 16);
            let n;
            let i;
            for (n = 2; encodedString.length - n > 0; n += 2) {
                i = parseInt(encodedString.substr(n, 2), 16) ^ r;
                email += String.fromCharCode(i);
            }
            if (!validateEmail(email)) {
                throw new Error('Email is not valid');
            }
            return email;
        };
        return decodeEmail(encodedString);
    } catch (error) {
        winston.silly(error);
        return;
    }

};

FieldProcessor.prototype.extractDate = function (stringExtract1, stringExtract2) {
    let date = stringExtract1.toLowerCase();
    if (date == '') {
        date = stringExtract2.toLowerCase();
    }

    if (date == '' || date.indexOf('asap') != -1 || date.indexOf('continuous') != -1) {
        return new Date();
    } else {
        return moment(date);
    }
};

FieldProcessor.prototype.extractDescription = function ($) {

    this.description = $('.field-name-field-req-job-description .field-items .field-item.even');
    let description = '';
    let impDescription = this.description.html();

    let about = $('.field-name-field-req-about-us .field-items .field-item.even').html();
    let offer = $('.field-name-field-req-salary-and-benefits .field-items .field-item.even').html();
    let want = $('.field-name-field-req-requirements .field-items .field-item.even').html();

    if (impDescription) {
        description += impDescription;
    }
    if (about && impDescription.substring(0, 20) != about.substring(0, 20)) {
        description += about;
    }
    if (offer) {
        description += offer;
    }
    if (want) {
        description += want;
    }
    return description;

};

FieldProcessor.prototype.extractDuration = function (duration) {
    // Kinda stupid as it is, but will probably add complexity so clauses are already here
    if (duration.toLowerCase().indexOf('1 Year')) {
        return 1;
    } else if (duration.toLowerCase().indexOf('2 Years')) {
        return 2;
    } else if (duration.toLowerCase().indexOf('6 months')) {
        return 1;
    } else {
        return 1;
    }
};

FieldProcessor.prototype.extractWorkload = function (workload) {
    workload = workload.toLowerCase();
    if (workload.indexOf('to') != -1) {
        let wlNumbers = workload.split(' to ');
        if (wlNumbers.length == 2) {
            return Math.round((Number(wlNumbers[0]) + Number(wlNumbers[1])) / 2);
        }
    } else if (workload.indexOf('+') != -1) {
        return workload.substring(0, workload.indexOf('+'));
    } else if (this.description) {
        let description = this.description.text().trim();
        return this.workloadRecognition(description);
    }
};

FieldProcessor.prototype.workloadRecognition = function (text) {
    let workload;
    let hasWeek = text.indexOf('week');
    let hasHours = text.indexOf('hour');

    if (hasWeek != -1 || hasHours != -1) {
        let subText = text.substr(hasWeek - 30, hasWeek + 30);

        // Match '32(2-digits) xxxxx(random string) hours'
        let hoursReg = /\d\d+.?(\w*)+(.hours)/;
        let match = hoursReg.exec(subText);
        if (match) {
            workload = subText.substring(match.index, match.index + 2);
            winston.silly('Match found at ' + match.index);
        }
    }
    return workload;
};

FieldProcessor.prototype.extractClassSize = function (classSize) {
    classSize = classSize.toLowerCase();
    if (classSize.indexOf('0 - 10') != -1) {
        return 0;
    } else if (classSize.indexOf('11 - 20') != -1) {
        return 1;
    } else if (classSize.indexOf('21 - 30') != -1) {
        return 2;
    } else {
        return 3;
    }
};

FieldProcessor.prototype.extractAgeGroup = function (ageGroup) {
    let ages = ageGroup.replace(/ /g, '').split('\n');
    let averageAge;
    if (ages.length == 2) {
        averageAge = Math.round((Number(ages[0]) + Number(ages[1])) / 2);
    }

    if (averageAge <= 10) {
        return 0;
    } else if (averageAge > 10 && averageAge <= 17) {
        return 1;
    } else if (averageAge > 17 && averageAge <= 23) {
        return 2;
    } else {
        return 3;
    }

};

FieldProcessor.prototype.extractAccomodation = function (accomodation) {
    accomodation = accomodation.toLowerCase();

    if (accomodation.indexOf('provided') != -1) {
        return 1;
    } else if (accomodation.indexOf('allowance') != -1) {
        return 2;
    } else {
        return 0;
    }
};

FieldProcessor.prototype.extractAirfare = function (airfare) {
    airfare = airfare.toLowerCase();

    if (airfare.indexOf('not') != -1) {
        return 0;
    } else if (airfare.indexOf('part') != -1) {
        return 2;
    } else if (airfare.indexOf('paid') != -1) {
        return 1;
    } else {
        return 0;
    }
};

FieldProcessor.prototype.extractAssistant = function (assistant) {
    assistant = assistant.toLowerCase();

    if (assistant.indexOf('yes') != -1) {
        return 1;
    }
    return 0;
};

FieldProcessor.prototype.extractLocation = async function (location) {

    // This could be turned into a recurrent functions
    location = location.toLowerCase();
    let locations;
    let result;

    if (location.indexOf(',') != -1) {
        locations = location.split(',');
        if (locations.length > 2) {
            return undefined;
        } else {
            for (location in locations) {
                result = this.findCityOrProvince(location);
                if (result.city) {
                    return result;
                }
            }
        }
    } else {
        result = this.findCityOrProvince(location);
    }
    return result;


};

FieldProcessor.prototype.findCityOrProvince = async function (location) {

    let result = {};

    let cities = await citiesController.queryCitiesByPinyinName(location, 100);
    if (cities.list.length > 0) {
        result.city = cities.list[0];
    } else {
        let provinces = await provincesController.queryProvincesByName(location, 100);
        if (cities.list.length > 0) {
            result.province = provinces.list[0];
        }
    }

    return result;
};

let jobCrawler = new JobCrawler();
module.exports = jobCrawler;
