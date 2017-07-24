module.exports = ({ articleData, categoryData }) => {
    return {
        loadArticlesPage(req, res) {
            if (!req.query.query) {
                return articleData.getAllArticles()
                    .then((articles) => {
                        res.render('articles-page', { articles });
                    });
            }

            return articleData.findArticles(req.query.query)
                .then((articles) => {
                    res.render('articles-page', { articles });
                });
        },
        loadArticleAddingPage(req, res) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            return categoryData.initCategories()
                .then(() => {
                    return categoryData.getAllCategoryNames();
                })
                .then((names) => {
                    return res.render('add-article-page', {
                        categories: names,
                    });
                });
        },
        addArticle(req, res) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            const articleObj = req.body;
            articleObj.author = req.user.username;
            articleObj.tags = req.body.tags.split(/[ ,]+/);


            return articleData.createArticle(articleObj)
                .then((inserted) => {
                    articleObj._id = inserted.insertedId;
                    return categoryData.addArticleToCategory(articleObj, articleObj.category);
                })
                .then(() => {
                    res.redirect('/articles');
                });
        },
        loadDetailsPage(req, res) {
            return articleData.getArticleById(req.params.id)
                .then((article) => {
                    res.render('article-details', { article });
                });
        },
        addComment(req, res) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            const comment = req.body;
            comment.author = req.user.username;

            return articleData.addCommentToArticle(req.params.id, comment)
                .then(() => {
                    res.redirect(`/articles/${req.params.id}`);
                });
        }
    };
};