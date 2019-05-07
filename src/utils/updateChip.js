const User = require('../UserModel');
const chipManager = require('./chipManager');

module.exports = async (username, chip) => {
    try {
        const user = await User.findOne({username});
        user.chip += chip;
        chipManager.update(user);
        await user.save();
    } catch (err) {
        throw new Error('Server error');
    }
};
