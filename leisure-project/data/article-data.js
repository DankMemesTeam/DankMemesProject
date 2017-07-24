module.exports = (articleCollection, validator, models, logger) => {
    const { Article } = models;

    return {
        createArticle(articleObject) {
            const article = new Article(
                articleObject.author,
                articleObject.title,
                articleObject.description,
                articleObject.content,
                articleObject.category,
                articleObject.tags,
            );

            return articleCollection.insertOne(article);
        },
        getAllArticles(pageNumber, pageSize) {
            return articleCollection.find();
        },
        findArticles(query) {
            return articleCollection.find({
                $or: [
                    { author: { $in: [query] } },
                    { title: { $in: [query] } },
                    { tags: { $in: [query] } },
                ],
            });
        },
        getArticleById(id) {
            return articleCollection.findById(id);
        },
        addCommentToArticle(articleId, comment) {
            const filter = {
                _id: articleCollection.generateId(articleId),
            };

            const update = {
                $addToSet: {
                    comments: comment,
                },
            }

            return articleCollection.findAndModify(filter, update);
        },
    };
};