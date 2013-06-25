var alchemy = require('./alchemy');
var sentiment = require('./sentiment');

module.exports.analyze = function (tweets, api, callback) {
   
   var analyzer = alchemy;

   if (api === 'sentiment140') {
      analyzer = sentiment;
   }

   analyzer.analyzeTweets(tweets, callback);
};