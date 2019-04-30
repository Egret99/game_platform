const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    name: {
        type: String
    },
    score: {
        type: Number,
        required: true
    }
});

userSchema.methods.verifyPassword = function(password) {
    return password === this.password;
}

const User = mongoose.model("User", userSchema);

module.exports = User;