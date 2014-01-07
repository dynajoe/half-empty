var alchemy = require('./alchemy');
var sentiment = require('./sentiment');

module.exports.analyze = function (tweets, api, callback) {
   sentiment.analyzeTweets(tweets, callback);
};