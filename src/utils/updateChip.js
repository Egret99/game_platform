const User = require('../UserModel');

module.exports = async (username, chip) => {
    try {
        const user = await User.findOne({username});
        user.chip = chip;
        await user.save();
    } catch (err) {
        res.send({
            status: 400,
            msg: "invalid operation"
        });
    }

    res.send({
        status: 200,
        user: {
            _id: user.id,
            username: user.username,
            name: user.name,
            chip: user.chip
        }
    })
};