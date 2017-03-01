var Article = require('./../models/article');
var imagesController = require('./images');

module.exports = {

    addArticle: function (user, article, callback) {
        var url = article.title.replace(/\s/g, '-');
        url = url.replace(/'+/g, '');
        Article.create({title: article.title, url:url, user:user, pictureUrl: article.avatarUrl, content: article.content, kicker: article.kicker}, function(err, newArticle){
            imagesController.addImage({
                    type: 4,
                    user: null,
                    school: null,
                    description: newArticle.title,
                    url: newArticle.pictureUrl,
                    date: Date.now()
                },
                function(err, image){
                    if(!err){
                        callback(err, newArticle);
                    }
                    else{
                        callback(err, newArticle);
                    }
                });
        });
    },

    getArticleByURL: function (url, callback){
        Article.findOne({url:url}).populate("user").exec(function(err,article){
            callback(article);
        });
    }

}