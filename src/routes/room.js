const gameManager = require('../utils/GameManager');
const User = require('../UserModel');

module.exports = app => {
    app.post('/room', (req, res) => {
        if (req.user) {
            if (gameManager.hasRoom(req.body.roomName)) {
                res.send({
                    status: 400,
                    msg: "room name already exist"
                });
            } else {
                if (gameManager.isFull()) {
                    res.send({
                        status: 400,
                        msg: "room number exceeds maximum"
                    });
                } else {
                    const room = gameManager.createRoom(req.body.roomName, req.body.description);
                    res.send({
                        status: 200,
                        msg: 'ok',
                        room: room.roomInfo,
                    })
                }
            }
        } else {
            res.send({
                status: 400,
                msg: "You are not authorized"
            });
        }
    });

    app.get('/room/:roomName', (req, res) => {
        if (req.user) {
            const room = gameManager.getRoomByName(req.params.roomName);
            res.send(Object.assign({ status: 200 }, room.roomInfoDetail));
        } else {
            res.send({
                status: 400,
                msg: "You are not authorized"
            });
        }
    });

    app.get('/room', (req, res) => {
        if (req.user) {
            const rooms = gameManager.allRoomsInfo;
            res.send({
                status: 200,
                msg: 'ok',
                rooms,
            });
        } else {
            res.send({
                status: 400,
                msg: "You are not authorized"
            });
        }
    });
};
