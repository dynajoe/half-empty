var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
var TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'http://half-empty.herokuapp.com/auth/twitter/callback';

passport.use(new TwitterStrategy({
   consumerKey: TWITTER_CONSUMER_KEY,
   consumerSecret: TWITTER_CONSUMER_SECRET,
   callbackURL: TWITTER_CALLBACK_URL
}, 
function(token, tokenSecret, profile, done) {
   return done(null, { id: profile.id, token: token, tokenSecret: tokenSecret, profile: profile });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
   done(null, user);
});

module.exports = function (app) {
   app.get('/auth/twitter', passport.authenticate('twitter'));
   app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' }));
};