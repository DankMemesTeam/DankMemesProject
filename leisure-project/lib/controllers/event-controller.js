module.exports = ({ userData, eventData, chatData }) => {
    return {
        loadEventsPage(req, res) {
            const pageNumber = req.query.page || 1;

            let loadEvents = null;

            if (!req.query.query) {
                loadEvents = eventData.getAllEvents(pageNumber);
            } else {
                // Take care of paging
                loadEvents = eventData.getEventsBy(req.query.query, pageNumber);
            }

            return loadEvents
                .then(([events, count, pageSize]) => {
                    res.render('event/event-page', {
                        currentUser: req.user || null,
                        events: events,
                        pageNumber,
                        pagesCount: Math.ceil(count / pageSize),
                        query: req.query.query,
                    });
                });
        },
        loadCreationPage(req, res) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            return res.render('event/event-create');
        },
        loadEventDetailsPage(req, res, next) {
            return eventData.getEventById(req.params.eventId)
                .then((event) => {
                    if (!event) {
                        return next(new Error('Invalid event id'));
                    }

                    return res.render('event/event-details',
                        { currentUser: req.user || null, event: event });
                })
                .catch(() => {
                    return next(new Error('Invalid operation'));
                });
        },
        createEvent(req, res) {
            if (!req.user) {
                return res.json({ redirectUrl: '/auth/login' });
            }


            const eventObj = {
                title: req.body.title,
                description: req.body.description,
                creator: req.user.username,
                participants: [req.user.username],
                location: {
                    address: req.body.address,
                    longitude: req.body.longitude,
                    latitude: req.body.latitude,
                },
            };

            const apiKey = 'AIzaSyCLFJNN2PJekPGTkfqk_weQTi-u7HCOuaI';

            const lat = req.body.latitude;
            const long = req.body.longitude;

            const mapType = 'maptype=roadmap';
            const mapSize = 'size=600x300';
            const zoom = 'zoom=17';
            const center = `center=${lat},${long}`;
            const marker = `&markers=color:red%7Clabel:C%7C${lat},${long}`;

            const googleMapsLink = `https://maps.googleapis.com/maps/api/staticmap?${mapSize}&${zoom}&${center}&${marker}&${mapType}&key=${apiKey}`;

            eventObj.location.mapUrl = googleMapsLink;

            let chatPromise = Promise.resolve(null);

            if (req.body.addChat) {
                chatPromise = chatData
                    .createEventChatroom([req.user.username],
                    'event', req.body.chatTitle);
            }

            return chatPromise
                .then((chat) => {
                    return eventData
                        .createEvent(eventObj, req.body.chatTitle || null);
                })
                .then((event) => {
                    return res.json({ redirectUrl: '/events' });
                })
                .catch((err) => {
                    return res.json({ errorMessage: 'Invalid event!' });
                });
        },
        addEventChat(req, res) {
            eventData.addChatToEvent(req.params.eventId, req.body.chatTitle)
                .then((event) => {
                    return chatData
                        .createEventChatroom(event.value.participants,
                        'event', req.body.chatTitle, event.value.headerImage);
                })
                .then((chat) => {
                    res.json({ redirectUrl: '/events/' + req.params.eventId });
                })
                .catch((err) => {
                    res.json({ errorMessage: 'Oops something went wrong!' });
                });
        },
        addUserToEvent(req, res, next) {
            if (!req.user) {
                return res.json({ redirectUrl: '/auth/login' });
            }

            return eventData
            .addUserToEvent(req.params.eventId, req.user.username)
                .then((event) => {
                    if (event.lastErrorObject.n === 0) {
                        return next(new Error('Invalid operation'));
                    }

                    if (event.value.chatTitle) {
                        return chatData
                            .addUserToChat(event.value.chatTitle,
                            req.user.username);
                    }
                })
                .then((result) => {
                    return res
                    .json({ redirectUrl: '/events/' + req.params.eventId });
                })
                .catch((err) => {
                    return res
                    .json({ errorMessage: 'Oops something went wrong!' });
                });
        },
        addComment(req, res) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            const comment = req.body;
            comment.author = {
                username: req.user.username,
            };

            return userData.findUserBy({ username: req.user.username })
                .then((foundUser) => {
                    comment.author.profilePic = foundUser.profilePic;
                    return eventData.addCommentToEvent(req.params.id, comment);
                })
                .then(() => {
                    return res.json({ comment: comment });
                })
                .catch(() => {
                    return res.json({ errorMessage: 'Invalid comment!' });
                });
        },
        loadEventEditPage(req, res, next) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            return eventData.getEventById(req.params.eventId)
                .then((event) => {
                    if (!event) {
                        return res.next(new Error('Invalid event id.'));
                    }

                    if (event.creator !== req.user.username) {
                        return next(new Error('Invalid operation'));
                    }

                    return res.render('event/event-edit', {
                        event,
                        currentUser: req.user
                            ? req.user.username
                            : null,
                        headerImages:
                        require('../../config/data-conf').event.headerPictures,
                    });
                })
                .catch(() => {
                    return next(new Error('Invalid operation'));
                });
        },
        editEvent(req, res, next) {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            return eventData.getEventById(req.params.eventId)
                .then((ev) => {
                    if (req.user.username !== ev.creator) {
                        return next(new Error('Invalid operation'));
                    }

                    return Promise.resolve();
                })
                .then(() => {
                    return eventData
                        .editEvent(req.params.eventId, req.body.title,
                        req.body.description, req.body.headerImage);
                })
                .then((result) => {
                    if (result.lastErrorObject.n === 0) {
                        return next(new Error('Invalid event id.'));
                    }


                    return res
                    .json({ redirectUrl: `/events/${req.params.eventId}` });
                })
                .catch(() => {
                    return res
                    .json({ errorMessage: 'Oops something went wrong!' });
                });
        },
    };
};
