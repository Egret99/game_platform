const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const http = require('http');
const socketIO = require('socket.io');
const cookieSession = require('cookie-session');
const gameManager = require('../src/utils/GameManager');

const publicPath = path.join(__dirname, '../index.html');

// connect to database
require('./services/mongoose');
const User = require('./UserModel');

// use passport to authenticate
require('./services/passport');

const app = express();
const server = http.Server(app);
const io = socketIO(server);
gameManager.setIO(io);

io.on('connection', (socket) => {
    console.log(`User ${socket.id} has connected.`);

    gameManager.addWaitingClient(socket);

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected.`);
    });
});

const keys = require('../config/keys');

app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
    maxAge: 10 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.set('Access-Control-Allow-Headers', 'content-type');
    res.set('Access-Control-Allow-Credentials', 'true');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(publicPath);
});

require('./routes/auth')(app);
require('./routes/user')(app);
require('./routes/room')(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('App listening to port %s', PORT);
});
