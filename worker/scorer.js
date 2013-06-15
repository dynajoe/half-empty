var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , cache = project.caches('twitter')
  , request = require('request')
  , tweets = require('./lib/tweets');

cache.info(function(err, res) {
   console.log('Conneted to cache: ' + JSON.stringify(res));
});

console.log('Scoring Worker');

require('./lib/payload_parser').parse_payload(process.argv, function (payload) {
   if(!payload.handle) {
      console.error('No twitter handle defined.');
      process.exit(1);
   }
   tweets.getTweets(payload.handle, function(err, tweets) {
      cache.put(payload.handle, JSON.stringify(tweets), function(err, msg) {
         if(err) {
            console.error('Failed to put to cache. ', err);
            process.exit(1);
         }
         console.log('Successfully stored ' + payload.handle + '\'s tweets! ' + JSON.stringify(msg));
      });
   });
});