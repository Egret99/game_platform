const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const keys = require('../../config/keys');
const User = require('../UserModel');

passport.serializeUser((user, cb) => {
    cb(null, user.username);
});

passport.deserializeUser(async (username, cb) => {
    const user = await User.findOne({username});
    cb(null, {
        username: user.username,
        name: user.name,
        score: user.score
    });
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: "http://localhost:3000/login/google/callback"
    }, async (accessToken, refreshToken, profile, cb) => {

        let user = await User.findOne({username: profile.id});

        if(!user) {
            user = new User({
                username: profile.id,
                name: profile.displayName,
                score: 0
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
                username: user.username,
                score: user.score
            });
          });
    }
  ));