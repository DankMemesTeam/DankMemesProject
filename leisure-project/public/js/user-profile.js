/* globals $ */

const getNumberValue = (str) => {
    return Number.parseInt(str.match(/\d+/)[0], 10);
};

const sendRate = (url) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: 'POST',
            success: resolve,
            error: reject,
        });
    });
};

const sendComment = (commentText, url) => {
    const comment = {
        commentContent: commentText,
    };

    return new Promise((resolve, reject) => {
        $.ajax({
            url,
            type: 'POST',
            dataType: 'json',
            data: comment,
            success: resolve,
            error: reject,
        });
    });
};

const createComment = (comment, $collection) => {
    const $li = $('<li></li>');
    $li.addClass('collection-item');

    const $a = $('<a></a>');
    $a.addClass('comment-username');
    $a.attr('href', '/users/' + comment.author);
    $a.html(comment.author);

    $li.append($a);
    $li.append(' said: ' + comment.content);

    $collection.prepend($li);
};

$(() => {
    $('.message-btn').click((ev) => {
        // Should think of better way to do this!
        const url = window.location.href.split('/');
        const username = url[url.length - 1];

        $.ajax({
            url: '/users/' + username + '/chats',
            type: 'POST',
            dataType: 'application/json',
            data: {
                pageUser: username,
            },
            // For some reason error handles the success request...
            error: function(data) {
                if (data.responseText) {
                    window.location.href = data.responseText;
                }
            },
        });
    });

    $('.rate-btn').click((ev) => {
        const $target = $(ev.target);

        let postUrl = $target.first().parent()
            .children().first().text();

        if ($target.hasClass('liked')) {
            postUrl = postUrl + '/dislike';
        } else {
            postUrl = postUrl + '/like';
        }

        sendRate(postUrl)
            .then(() => {
                let statusLikes = getNumberValue($target.prev().html());

                $target.toggleClass('liked');

                if ($target.hasClass('liked')) {
                    $target.html('Unlike');
                    $target.prev().html(++statusLikes + ' likes.');
                } else {
                    $target.html('Like');
                    $target.prev().html(--statusLikes + ' likes.');
                }
            });
    });

    $('.comment-form').submit((ev) => {
        ev.preventDefault();

        const commentText = $(ev.target).children('input').val().trim();
        const url = $(ev.target).attr('action');

        sendComment(commentText, url)
            .then((comment) => {
                const $collection = $(ev.target).parent().parent().next().children('ul');
                createComment(comment, $collection);
                $(ev.target).children('input').val('');
            });
    });
});
