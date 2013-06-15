var request = require('request')
  , async = require('async');

module.exports.analyzeTweets = function(tweets, cb) {
   async.map(tweets, analyzeTweet, function(err, results) {
      if (err) return cb(err);
      return cb(null, results);
   });
}

function analyzeTweet(tweet, cb) {
   request.post('http://access.alchemyapi.com/calls/text/TextGetTextSentiment', {
      form: {  
         apikey: 'a06ca02ad7c2e23ce1f35792825c902d5e48e4ef', 
         outputMode: 'json',
         text: tweet.text
      },
      json: true
   }, function(err, res, data) {
      if (err) return cb(err);
      if (data.status == "ERROR") {
         tweet.sentiment = { type: "neutral" };
      }
      else {
         tweet.sentiment = data.docSentiment;
      }
      
      return cb(null, tweet);
   });
}