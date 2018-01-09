const Article = require('./../models/article');
const imagesController = require('./images');

module.exports = {

  addArticle: async (user, article) => {
    const url = article.title.replace(/\s/g, '-').replace(/'+/g, '').toLowerCase();
    let newArticle = await Article.create({
      title: article.title,
      url,
      user,
      pictureUrl: article.avatarUrl,
      content: article.content,
      kicker: article.kicker
    });
    return imagesController.addImage({
      type: 4,
      user: null,
      school: null,
      description: newArticle.title,
      url: newArticle.pictureUrl,
      date: Date.now()
    });
  },

  getArticleByURL(url) {
    return Article.findOne({url}).populate('user').exec();
  },

  getArticles() {
    return Article.find().populate('user').exec();
  }

};
