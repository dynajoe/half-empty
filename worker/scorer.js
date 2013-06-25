var request = require('request')
  , twitter = require('./lib/twitter')
  , analyzer = require('./lib/analyzer');

console.log('Process Arguments: ', process.argv);
console.log('Scoring Worker');

require('./lib/payload_parser').parse_payload(process.argv, function (payload) {

   console.log("Payload: ", payload);

   if (!payload.handle) {
      console.error('No twitter handle defined.');
      return process.exit(1);
   }

   var ironio = require('node-ironio')(payload.iron_token);
   var project = ironio.projects(payload.iron_project);
   var twitterCache = project.caches('twitter');
   var twitter_handle = payload.handle.toLowerCase().trim();
   
   twitter.getTweets(payload, function(err, data) {
      if (err) {
         if (err.statusCode == 404) {
            twitterCache.put(twitter_handle, 'null', function(err, msg) {
               if (err) {
                  console.error('Failed to put to cache. ', err);
                  process.exit(1);
               }
               console.log('Twitter user \'' + twitter_handle + '\' doesn\'t exist, but we were successful anyway.' + JSON.stringify(msg));
               process.exit(0);
            })
         }
         else {
            console.error('Failed to retrieve tweets for user: ' + twitter_handle, err, payload);
            process.exit(1);
         }
         return;
      }
      console.log('Retrieved ' + data.tweets.length + ' tweets for user ' + twitter_handle);
      analyzer.analyze(data.tweets, payload.analyzer || 'alchemy', function(err, analyzedTweets) {
         if (err) {
            console.error('Failed to analyze tweets for user: ' + twitter_handle, err, payload);
            process.exit(1);
         }
         console.log('Analyzed ' + analyzedTweets.length + ' tweets for user ' + twitter_handle);
         twitterCache.put(twitter_handle, JSON.stringify(data), function(err, msg) {
            if (err) {
               console.error('Failed to put to cache. ', err, payload);
               process.exit(1);
            }
            console.log('Successfully stored ' + twitter_handle + '\'s tweets! ' + JSON.stringify(msg));
         });
      });
   });
});