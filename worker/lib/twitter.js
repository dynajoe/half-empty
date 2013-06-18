var twitter = require('ntwitter');
var moment = require('moment');
var async = require('async');

function getUser(tweet) {
   return tweet.user;
}

function getModifiedTweet(tweet) {
   var modifiedTweet = { 
      id: tweet.id,
      created_at: tweet.created_at,
      in_reply_to_user_id: tweet.in_reply_to_user_id,
      in_reply_to_status_id: tweet.in_reply_to_status_id,
      retweet_count: tweet.retweet_count,
      favorite_count: tweet.favorite_count,
      text: tweet.text,

   };
   if (tweet.retweeted_status) {
      modifiedTweet.retweeted_status = {
         id: tweet.retweeted_status.id,
         screen_name: tweet.retweeted_status.screen_name,
         created_at: tweet.retweeted_status.created_at
      };
   }
   return modifiedTweet;
}

module.exports.getTweets = function (payload, cb) {
   var twitter_handle = payload.handle.toLowerCase().trim();

   var oldestTweet;
   var lastOldestTweet;
   var tweets = [];
   var user;

   var twitConfig = {
      consumer_key: payload.twitter_consumer_key,
      consumer_secret: payload.twitter_consumer_secret,
      access_token_key: payload.twitter_api_token,
      access_token_secret: payload.twitter_api_secret
   };

   console.log(twitConfig);

   var twit = new twitter(twitConfig);

   async.until(
      function () {
         return tweets.length > 800 || (oldestTweet && lastOldestTweet && oldestTweet.id === lastOldestTweet.id);
      },
      function (callback) {
         var opts = {
            screen_name: twitter_handle,
            count: 800
         };
         if (oldestTweet) {
            opts.max_id = oldestTweet.id;
         }
         twit.getUserTimeline(opts, function(err, data) {
            if (err) return callback(err);
            if (!user) {
               user = data[0].user;
            }
            console.log('Twitter Paging: Retrieved ' + data.length + ' more tweets');
            for (var i = data.length - 1; i >= 0; i--) {
               if(oldestTweet && data[i].id === oldestTweet.id) continue;
               tweets.push(getModifiedTweet(data[i]));
            };
            console.log('Twitter Paging: Now have retrieved ' + tweets.length + ' total tweets for user ' + twitter_handle);
            lastOldestTweet = oldestTweet;
            oldestTweet = data[data.length - 1];
            callback();
         });
      },
      function (err) {
         if (err) {
            return cb(err);
         }

         return cb(null, { user: user, tweets: tweets});
      }
   );
}