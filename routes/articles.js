const express = require('express');
const router = express.Router();
const moment = require('moment');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const articlesController = require('../controllers/articles');
const scripts = require('../public/scripts');
const settings = require('simplesettings');
const fcbAppId = settings.get('FCB_APP_ID');

module.exports = function(passport) {

  router.route('/article/add')
    .get((req, res) => {
      res.render('article/addarticle', {
        pictureInfo: pictureinfo,
        fcbAppId,
        user: req.user,
        jadefunctions,
        moment,
        scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE]
      });
    })
    .post(async (req, res) => {
      let article = await articlesController.addArticle(req.user, req.body);
      res.redirect(`/article/${article.url}`);
    });

  router.get('/:url', async (req, res) => {

    const url = req.params.url;
    let article = await articlesController.getArticleByURL(url);
    res.render('article/article', {
      fcbAppId,
      article,
      user: req.user,
      pictureInfo: pictureinfo,
      jadefunctions,
      moment,
      scripts: [scripts.util]
    });

  });

  router.get('/', async (req, res) => {

    let articles = await articlesController.getArticles();
    articles = jadefunctions.trunkArticlesContent(articles, 150);
    res.render('article/articles', {
      fcbAppId,
      articles,
      user: req.user,
      pictureInfo: pictureinfo,
      jadefunctions,
      moment,
      scripts: [scripts.util]
    });

  });

  return router;
};
