var twitter = require('ntwitter');
var moment = require('moment');
var async = require('async');

var twit = new twitter({
  consumer_key: '6F9g1bQtl8l14AkJzBgw',
  consumer_secret: 'ix9O34lNgaVqIk6TJvKp5AZbeboMDF8MxBEIl8WtIQ',
  access_token_key: '49359644-yJBynxQGA5eYEpAwcOq8RzWP9X0gUIOnNPOaEBeH4',
  access_token_secret: 'etIdekP6F3vAse8iD3K5nxKSQHyJZN8xiCbGLIIls'
});

module.exports.getTweets = function(handle, cb) {
   var oldestTweet;
   var lastOldestTweet;
   var tweets = [];

   async.until(
      function () {
         return tweets.length > 1000 || (oldestTweet && lastOldestTweet && oldestTweet.id === lastOldestTweet.id);
      },
      function (callback) {
         var opts = {
            screen_name: handle,
            count: 1000
         };
         if (oldestTweet) {
            opts.max_id = oldestTweet.id;
         }
         twit.getUserTimeline(opts, function(err, data) {
            if (err) return callback(err);

            console.log('Twitter Paging: Retrieved ' + data.length + ' more tweets');
            for (var i = data.length - 1; i >= 0; i--) {
               if(oldestTweet && data[i].id === oldestTweet.id) continue;
               tweets.push(data[i]);
            };
            console.log('Twitter Paging: Now have retrieved ' + tweets.length + ' total tweets for user ' + handle);
            lastOldestTweet = oldestTweet;
            oldestTweet = data[data.length - 1];
            callback();
         });
      },
      function (err) {
         if (err) {
            return cb(err);
         }

         return cb(null, tweets);
      }
   );
}