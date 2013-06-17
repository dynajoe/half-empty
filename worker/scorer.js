var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , twitterCache = project.caches('twitter')
  , request = require('request')
  , twitter = require('./lib/twitter')
  , alchemy = require('./lib/alchemy');

console.log('Scoring Worker');

require('./lib/payload_parser').parse_payload(process.argv, function (payload) {
   if(!payload.handle) {
      console.error('No twitter handle defined.');
      process.exit(1);
   }
   
   var twitter_handle = payload.handle.toLowerCase().trim();
   var twitter_api_secret = payload.twitter_api_secret
   var twitter_api_token = payload.twitter_api_token;
   
   twitter.getTweets(twitter_handle, twitter_api_token, twitter_api_secret, function(err, data) {
      if(err) {
         if (err.statusCode == 404) {
            twitterCache.put(twitter_handle, 'null', function(err, msg) {
               if(err) {
                  console.error('Failed to put to cache. ', err);
                  process.exit(1);
               }
               console.log('Twitter user \'' + twitter_handle + '\' doesn\'t exist, but we were successful anyway.' + JSON.stringify(msg));
               process.exit(0);
            })
         }
         else {
            console.error('Failed to retrieve tweets for user: ' + twitter_handle, err);
            process.exit(1);
         }
         return;
      }
      console.log('Retrieved ' + data.tweets.length + ' tweets for user ' + twitter_handle);
      alchemy.analyzeTweets(data.tweets, function(err, analyzedTweets) {
         if(err) {
            console.error('Failed to analyze tweets for user: ' + twitter_handle, err);
            process.exit(1);
         }
         console.log('Analyzed ' + analyzedTweets.length + ' tweets for user ' + twitter_handle);
         twitterCache.put(twitter_handle, JSON.stringify(data), function(err, msg) {
            if(err) {
               console.error('Failed to put to cache. ', err);
               process.exit(1);
            }
            console.log('Successfully stored ' + twitter_handle + '\'s tweets! ' + JSON.stringify(msg));
         });
      });
   });
});