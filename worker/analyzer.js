var alchemy = require('./lib/alchemy');
var sentiment = require('./lib/sentiment');

module.exports.analyze = function (tweets, api, callback) {
   
   var analyzer = alchemy;

   if (api === 'sentiment140') {
      analyzer = sentiment;
   }

   analyzer.analyzeTweets(data.tweets, callback);
};