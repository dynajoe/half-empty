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
   twitter.getTweets(payload.handle, function(err, tweets) {
      if(err) {
         if (err.statusCode == 404) {
            twitterCache.put(payload.handle, 'null', function(err, msg) {
               if(err) {
                  console.error('Failed to put to cache. ', err);
                  process.exit(1);
               }
               console.log('Twitter user \'' + payload.handle + '\' doesn\'t exist, but we were successful anyway.' + JSON.stringify(msg));
               process.exit(0);
            })
         }
         else {
            console.error('Failed to retrieve tweets for user: ' + payload.handle, err);
            process.exit(1);
         }
         return;
      }
      console.log('Retrieved ' + tweets.length + ' tweets for user ' + payload.handle);
      alchemy.analyzeTweets(tweets, function(err, analyzedTweets) {
         if(err) {
            console.error('Failed to analyze tweets for user: ' + payload.handle, err);
            process.exit(1);
         }
         console.log('Analyzed ' + analyzedTweets.length + ' tweets for user ' + payload.handle);
         twitterCache.put(payload.handle, JSON.stringify(tweets), function(err, msg) {
            if(err) {
               console.error('Failed to put to cache. ', err);
               process.exit(1);
            }
            console.log('Successfully stored ' + payload.handle + '\'s tweets! ' + JSON.stringify(msg));
         });
      });
   });
});