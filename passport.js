var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CONSUMER_KEY = process.env.HE_TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.HE_TWITTER_CONSUMER_SECRET;
var TWITTER_CALLBACK_URL = process.env.HE_TWITTER_CALLBACK_URL || 'http://localhost:3000/auth/twitter/callback';

passport.use(new TwitterStrategy({
   consumerKey: TWITTER_CONSUMER_KEY,
   consumerSecret: TWITTER_CONSUMER_SECRET,
   callbackURL: TWITTER_CALLBACK_URL
}, 
function (token, secret, profile, done) {
   var user = { 
      id: profile.id, 
      name: profile.username,
      protected: profile["_json"].protected,
      twitter_api_token: token, 
      twitter_api_secret: secret, 
      profile: profile 
   };

   return done(null, user);
}));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
   done(null, user);
});

module.exports = function (app) {
   app.get('/auth/twitter', passport.authenticate('twitter'));
   app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' }));
};