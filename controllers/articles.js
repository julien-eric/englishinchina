const Article = require('./../models/article');
const imagesController = require('./images');

module.exports = {

  addArticle(user, article, callback) {
    const url = article.title.replace(/\s/g, '-').replace(/'+/g, '').toLowerCase();
    Article.create({
      title: article.title, url, user, pictureUrl: article.avatarUrl, content: article.content, kicker: article.kicker,
    }, (err, newArticle) => {
      imagesController.addImage(
        {
          type: 4,
          user: null,
          school: null,
          description: newArticle.title,
          url: newArticle.pictureUrl,
          date: Date.now(),
        },
        (err, image) => {
          if (!err) {
            callback(err, newArticle);
          } else {
            callback(err, newArticle);
          }
        },
      );
    });
  },

  getArticleByURL(url, callback) {
    Article.findOne({ url }).populate('user').exec((err, article) => {
      callback(article);
    });
  },

  getArticles(callback) {
    Article.find().populate('user').exec((err, articles) => {
      callback(articles);
    });
  },

};
