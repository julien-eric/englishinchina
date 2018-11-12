const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const _ = require('underscore');

let SEARCH_WORD = 'stemming';
let MAX_PAGES_TO_VISIT = 10;


let JobCrawler = function () { };

JobCrawler.prototype.init = function (pageToVisit) {

    this.pagesToVisit = [];
    this.numPagesVisited = 0;
    this.pagesVisited = {};
    this.pagesToVisit.push(pageToVisit);
    this.url = new URL(pageToVisit);
    this.baseUrl = this.url.protocol + '//' + this.url.hostname;
    this.crawl(pageToVisit);
};

JobCrawler.prototype.crawl = function (pageToVisit) {

    if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log('Reached max limit of number of pages to visit.');
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
        console.log('Initial page and relative links have been crawled');
    }
};

JobCrawler.prototype.visitPage = function (url, callback) {
    // Add page to our set
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    // Make the request
    console.log('Visiting page ' + url);

    request(url, (error, response, body) => {
        // Check status code (200 is HTTP OK)
        console.log('Status code: ' + response.statusCode);
        if (response.statusCode !== 200) {
            callback();
            return;
        }
        // Parse the document body
        let $ = cheerio.load(body);
        let isWordFound = this.searchForWord($, SEARCH_WORD);
        if (isWordFound) {
            console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
        } else {
            this.collectInternalLinks($);
            // In this short program, our callback is just calling crawl()
            let crawl = _.bind(callback, this);
            crawl();
        }
    });
};

JobCrawler.prototype.searchForWord = function ($, word) {
    let bodyText = $('html > body').text().toLowerCase();
    return (bodyText.indexOf(word.toLowerCase()) !== -1);
};

JobCrawler.prototype.collectInternalLinks = function ($) {
    let that = this;

    // let relativeLinks = $('a[href^="/"]');
    // console.log('Found ' + relativeLinks.length + ' relative links on page');
    // relativeLinks.each(function() {
    //   that.pagesToVisit.push(that.baseUrl + $(this).attr('href'));
    // });

    let absoluteLinks = $('a[href^="http://www.eslcafe.com/jobs/china/index.cgi?read="]');
    console.log('Found ' + absoluteLinks.length + ' absolute links on page');
    absoluteLinks.each(function () {
        that.pagesToVisit.push($(this).attr('href'));
    });
};

let jobCrawler = new JobCrawler();
module.exports = jobCrawler;
