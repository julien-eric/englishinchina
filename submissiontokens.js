const uuidv1 = require('uuid/v1');
const TOKEN_EXPIRY_TIME = 1000 * 60 * 60;
// const CONT_TOKEN_PRUNING = 1000;
const _ = require('underscore');

// Token States
const ALIVE = 0;
const PROCESSING = 1;
const PROCESSED = 2;
const TIMED_OUT = 7;

let SubmissionToken = function () {
  this.value = uuidv1();
  this.state = ALIVE;
  setTimeout(this.autoExpire.bind(this), TOKEN_EXPIRY_TIME);
};

SubmissionToken.prototype.autoExpire = function () {
  this.state = TIMED_OUT;
  // submissionTokensController.pruneExpiredToken(this.value);
};

SubmissionToken.prototype.processed = function () {
  this.state = PROCESSED;
};

SubmissionToken.prototype.processing = function () {
  this.state = PROCESSING;
};

SubmissionToken.prototype.setUrl = function (url) {
  this.url = url;
};

let SubmissionTokensController = function () {
  this.tokens = [];
  this.ALIVE = ALIVE;
  this.PROCESSING = PROCESSING;
  this.PROCESSED = PROCESSED;
  this.TIMED_OUT = TIMED_OUT;

};

SubmissionTokensController.prototype.pruneExpiredToken = function (tokenValue) {
  this.tokens.splice(_.findIndex(this.tokens, { value: tokenValue }), 1);
};

SubmissionTokensController.prototype.createToken = function () {
  let token = new SubmissionToken();
  let length = this.tokens.push(token);
  return this.tokens[length - 1];
};

SubmissionTokensController.prototype.recuperateToken = function (submissionTokenVal) {
  let userToken = _.findWhere(this.tokens, { value: submissionTokenVal });
  return userToken;
};

let submissionTokensController = new SubmissionTokensController();
module.exports = submissionTokensController;
