const passport = require('passport');
const User = require('../UserModel');
const gameManager = require('../utils/GameManager');

module.exports = (app) => {
    app.get('/login/google', passport.authenticate('google', {
        scope: ['profile']
    }));

    app.get('/login/google/callback', passport.authenticate('google'), (req, res) => {
        res.redirect('/');
    });

    app.get('/me', async (req, res) => {
        if (req.user) {
            res.send({
                status: 200,
                msg: 'ok',
                user: req.user
            })
        } else {
            res.send({
                status: 400,
                msg: 'Not logged in',
            })
        }
    });

    app.post('/register', async (req, res) => {
        let user = await User.find({username: req.body.username});
        if (user.length <= 0) {
            user = new User({
                username: req.body.username,
                password: req.body.password,
                name: req.body.username,
                chip: 200
            });

            await user.save();

            res.send({
                status: 200,
                user: {
                    username: req.body.username,
                    name: req.body.username,
                    score: req.body.score
                }
            });
        } else {
            res.send({
                status: 400,
                msg: "username in use"
            })
        }
    });

    app.post('/login', passport.authenticate('local'), async (req, res) => {
        res.send({
            status: 200,
            user: req.user
        })
    });

    app.get('/logout', async (req, res) => {
        if (req.user) {
            req.logout();
            res.send({
                status: 200,
                msg: "Log out sucessful."
            });
        } else {
            res.send({
                status: 400,
                msg: "You are not logged in."
            });
        }
    });

    app.post('/socket', (req, res) => {
        if (req.user) {
            const socket = gameManager.authorizeSocket(req.body.socketId, req.user.user, req.body.roomName);
            if (socket) {
                res.send({
                    status: 200,
                    msg: 'ok',
                });
            } else {
                res.send({
                    status: 400,
                    msg: 'Socket not found!',
                })
            }
        } else {
            res.send({
                status: 401,
                msg: 'Not authorized!',
            });
        }
    });
}
