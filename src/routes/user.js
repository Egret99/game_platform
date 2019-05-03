const User = require('../UserModel');

module.exports = app => {
    app.patch('/me', async (req, res) => {
        if (!req.user) {
            return res.send({
                status: 400,
                msg: "not authorized"
            })
        }

        const user = await User.findById(req.user._id);
        const updates = Object.keys(req.body);
        const allowedUpdates = ["password", "name", "chip"];
        const validUpdates = updates.every(update => allowedUpdates.includes(update));

        if (!validUpdates) {
            return res.send({
                status: 400,
                msg: "invalid updates"
            })
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        res.send({
            status: 200,
            user: {
                _id: user.id,
                username: user.username,
                name: user.name,
                chip: user.chip
            }
        })
    })
}