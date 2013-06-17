var passport = require('passport')
, TwitterStrategy = require('passport-twitter').Strategy;

var TWITTER_CONSUMER_KEY = 'HiRj7aQ8hPXsXYBEW8LMKg';
var TWITTER_CONSUMER_SECRET = 'a0c9gAQ2gFWP4CkXQrgnAKokrVHZQ6eFCe9dTjM2Pe4';

passport.use(new TwitterStrategy({
   consumerKey: TWITTER_CONSUMER_KEY,
   consumerSecret: TWITTER_CONSUMER_SECRET,
   callbackURL: "http://half-empty.herokuapp.com/auth/twitter/callback"
}, function(token, tokenSecret, profile, done) {
   done(null, { token: token, tokenSecret: tokenSecret, profile: profile });
}));

module.exports = function (app) {
   app.get('/auth/twitter', passport.authenticate('twitter'));
   app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));
}


