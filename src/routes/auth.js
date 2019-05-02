const passport = require('passport');

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
                user: req.user
            })
        } else {
            res.send({
                status: 400,
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
                score: 0
            });

            await user.save();
    
            res.send({
                status: 201,
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
    })
}