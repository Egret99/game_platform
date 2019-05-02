const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const cookieSession = require('cookie-session');
const publicPath = path.join(__dirname, '../index.html');

// connect to database
require('./services/mongoose');
const User = require('./UserModel');

// use passport to authenticate
require('./services/passport');

const app = express();

const keys = require('../config/keys');

app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
    maxAge: 10 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'content-type');
    next();
});

app.get('/', (req, res) => {
    console.log(req.user);
    res.sendFile(publicPath);
})

require('./routes/auth')(app);
require('./routes/user')(app);

const PORT = 3000;
app.listen(PORT, () => {
    console.log('App is running on port %s', 3000);
});
