const express = require('express');
const router = express.Router();
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const jobsController = require('../controllers/jobscontroller');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const settings = require('simplesettings');
const butter = require('buttercms')(settings.get('BUTTER_CMS_API'));
const utils = require('../utils');

module.exports = function (passport) {

    router.get('/', async (req, res) => {

        let response = await butter.post.list({ page: 1, page_size: 10, exclude_body: true });
        let articles = response.data.data;
        let categories = (await butter.category.list({ page: 1, page_size: 6 })).data.data;
        categories.unshift({ name: 'All articles', slug: 'all-articles' });

        res.render('article/articles', {
            title: `Blog - Second Language World`,
            user: req.user,
            articles,
            currentCategory: { slug: 'all-articles' },
            categories,
            moment,
            jadefunctions,
            pictureInfo: pictureinfo,
            scripts: [scripts.util, scripts.libekkolightbox]
        });
    });

    router.get('/category/:slug', async (req, res) => {

        let slug = req.params.slug;

        let response = await butter.category.retrieve(slug, { include: 'recent_posts' });
        let currentCategory = response.data.data;
        let articles = currentCategory.recent_posts;

        let categories = (await butter.category.list({ page: 1, page_size: 6 })).data.data;
        categories.unshift({ name: 'All articles', slug: 'all-articles' });


        res.render('article/articles', {
            title: slug + ' - Second Language World',
            user: req.user,
            articles,
            currentCategory,
            categories,
            moment,
            jadefunctions,
            pictureInfo: pictureinfo,
            scripts: [scripts.util, scripts.libekkolightbox]
        });
    });

    router.get('/:slug', async (req, res) => {

        let slug = req.params.slug;

        let response = await butter.post.retrieve(slug);
        let article = response.data.data;

        response = await butter.post.list({ page: 1, page_size: 3, exclude_body: true });
        let featuredArticles = response.data.data;

        let featuredJobs = await jobsController.getFeaturedJobs();

        let meta = utils.generateMeta(
            article.title,
            article.summary,
            utils.getFullUrl(req),
            article.featured_image
        );

        res.render('article/single/article', {
            meta,
            title: `Blog - Second Language World`,
            user: req.user,
            article,
            featuredArticles,
            featuredJobs,
            moment,
            jadefunctions,
            pictureInfo: pictureinfo,
            scripts: [scripts.util, scripts.libekkolightbox]
        });
    });

    return router;

};
