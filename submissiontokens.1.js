const uuidv1 = require('uuid/v1');
// const TOKEN_EXPIRY_TIME = 1000 * 60 * 10;
const TOKEN_EXPIRY_TIME = 1000;
const TOKEN_PRUNING = 1000;
const _ = require('underscore');

// Token States
const ALIVE = 0;
const PROCESSING = 1;
const PROCESSED = 2;
const TIMED_OUT = 7;

let SubmissionToken = function () {
  this.value = uuidv1();
  this.state = ALIVE;

  setTimeout(() => {
    this.state = TIMED_OUT;
    SubmissionTokensController.prototype.pruneExpiredTokens(this.value);
  }, TOKEN_EXPIRY_TIME);
};

// SubmissionToken.prototype.autoExpire = () => {};

SubmissionToken.prototype.processed = () => {
  this.state = PROCESSED;
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

  // setTimeout(() => {
  //   this.pruneExpiredTokens();
  // }, TOKEN_PRUNING);

};

SubmissionTokensController.prototype.pruneExpiredTokens = function (tokenValue) {

  this.tokens = _.filter(this.tokens, function (token) {
    return token.state != this.TIMED_OUT;
  });
};

SubmissionTokensController.prototype.createToken = function () {
  let token = new SubmissionToken();
  let length = this.tokens.push(token);
  return this.tokens[length - 1];
};

SubmissionTokensController.prototype.recuperateToken = function (submissionTokenVal) {
  let userToken = _.findWhere(this.tokens, { value: submissionTokenVal });
  userToken.state = PROCESSING;
  return userToken;
};

let submissionTokensController = new SubmissionTokensController();
module.exports = submissionTokensController;
