const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const keys = require('../../config/keys');
const User = require('../UserModel');

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
    const user = await User.findById(id);
    if (user) {
        cb(null, {
            _id: user.id,
            username: user.name,
            name: user.name,
            chip: user.chip
        });
    } else {
        cb(null, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: "http://poker.billyzou.com/login/google/callback"
    }, async (accessToken, refreshToken, profile, cb) => {

        let user = await User.findOne({username: profile.id});

        if(!user) {
            user = new User({
                username: profile.id,
                name: profile.displayName,
                chip: 200
            });
            await user.save();
        }
        cb(null, user);
    }
));

passport.use(new LocalStrategy(
    async (username, password, cb) => {
        User.findOne({ username }, (err, user) => {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            if (!user.verifyPassword(password)) { return cb(null, false); }
            return cb(null, {
                _id: user._id,
                username: user.username,
                chip: user.chip
            });
          });
    }
  ));
