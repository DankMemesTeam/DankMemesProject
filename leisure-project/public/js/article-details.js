/* globals $ */

const getIcon = (type) => {
    return '<i class="material-icons right">' + type + '</i>';
};

const sendRating = (type) => {
    const articleId = window.location.href.split('articles/')[1];

    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/articles/' + articleId + '/' + type,
            type: 'POST',
            success: resolve,
            error: reject,
        });
    });
};

const getNumberValue = (str) => {
    return Number.parseInt(str.match(/\d+/)[0]);
};

const sendComment = (commentText) => {
    const articleId = window.location.href.split('articles/')[1];

    const comment = {
        text: commentText,
    };

    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/articles/' + articleId,
            type: 'POST',
            data: comment,
            success: resolve,
            error: reject,
        });
    });
};

const createComment = (comment) => {
    const $li = $('<li></li>');
    $li.addClass('collection-item avatar');

    const $img = $('<img>');
    $img.addClass('circle');
    $img.attr('src', comment.author.profilePic);

    const $a = $('<a></a>');
    $a.addClass('title');
    $a.attr('href', '/users/' + comment.author.username);
    $a.html(comment.author.username);

    const $p = $('<p></p>');
    $p.html(comment.text);

    $li.append($img);
    $li.append($a);
    $li.append($p);

    $('#comments-list').append($li);
};

$('#rate-btn').on('click', (ev) => {
    const $target = $('#rate-btn');
    const state = $target.text();

    if (state.indexOf('Unlike') !== -1) {
        sendRating('unlike')
            .then(() => {
                $target.html('Like' + getIcon('thumb_up'));
                let currentCount = getNumberValue($('#likes-count').html());
                $('#likes-count').html(--currentCount + ' likes.');
            });
    } else {
        sendRating('like')
            .then(() => {
                $target.html('Unlike' + getIcon('thumb_down'));
                let currentCount = getNumberValue($('#likes-count').html());
                $('#likes-count').html(++currentCount + ' likes.');
            });
    }
});

$('#send-comment-btn').on('click', (ev) => {
    const commentText = $('#comment-content').val().trim();

    sendComment(commentText)
        .then((comment) => {
            createComment(comment);
            $('#comment-content').val('');
        })
        .catch((err) => {
            console.log('Error');
        });
});