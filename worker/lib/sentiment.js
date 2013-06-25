var request = require('request')
  , async = require('async')
  , _ = require('underscore');
/*
0: negative
2: neutral
4: positive
*/

module.exports.analyzeTweets = function(tweets, cb) {
   console.log(tweets[0]);
   request.post('http://www.sentiment140.com/api/bulkClassifyJson', { 
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
         data: tweets
      }),
      json: true 
   }, function (err, res, body) {

      if (err || !body) {
         return cb('unable to analyze tweets');
      }
      
      body.data.forEach(function (t) {
         t.sentiment = t.sentiment || {};

         switch (t.polarity) {
            case 0:
               t.sentiment.type = "negative";
               t.sentiment.score = -1.0;
            break;
            case 2:
               t.sentiment.type = "neutral";
               t.sentiment.score = 0;
               
            break;
            case 4:
               t.sentiment.type = "positive";
               t.sentiment.score = 1.0;
            break;
         }
      });

      cb(null, body.data);
   });
};