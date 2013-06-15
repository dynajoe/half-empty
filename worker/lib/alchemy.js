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
         apikey: '435de1c638f3743fec343bc8e7df8e088c0581e7', 
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