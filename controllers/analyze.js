var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk'),
   project = ironio.projects('51bbd144ed3d766cf3000ab6'),
   cache = project.caches('twitter'),
   _ = require('underscore'),
   calc = require('../lib/calculate'),
   peerindex = require('../lib/peerindex'),
   klout = require('../lib/klout'),
   async = require('async'),
   moment = require('moment');

var cleanTopicText = function (topics) {
   topics.forEach(function (t) {
      t.text = t.text.replace(/ programming$/i, '');
   });

   return _.sortBy(topics, function (t) { return t.text; });
};

var submitWorker = function (twitter_handle, callback) {
   project.tasks.queue({ code_name: 'scorer', payload: JSON.stringify({ handle: twitter_handle }) }, function (err, res) {
      res = res || { tasks: [] };
      callback(err, res.tasks[0].id);
   });
};

module.exports = function (app) {
   
   app.get('/clear/:handle', function (req, res) {
      cache.del(req.params.handle, function (err, data) {
         res.redirect('/');
         res.end();
      });
   });

   app.get('/analyze/:handle', function (req, res) {
      res.setHeader('Content-Type', 'application/json');
               
      var twitter_handle = req.params.handle;
      
      if (!twitter_handle) {
         res.writeHead(400);
         return res.end('A twitter handle is required.');
      }

      twitter_handle = twitter_handle.toLowerCase().trim();

      cache.get(twitter_handle, function (err, data) {
         if (err) {
            res.writeHead(500);
            res.end();
            return;
         }

         if (data) {
            var parsed = JSON.parse(data);
            
            if (parsed && parsed.tweets) {
               var user = parsed.user;
               var tweets = parsed.tweets;

               console.log('Crunching ' + tweets.length + ' for ' + twitter_handle);

               async.parallel([
                  function (cb) { peerindex.getTopics(twitter_handle, cb); },
                  function (cb) { klout.getTopics(twitter_handle, cb); },
                  function (cb) { klout.getInfluencers(twitter_handle, cb); }
               ], function (err, results) {
                  var piTopics = results[0] || [];
                  var kTopics = results[1] || [];
                  var influencers = results[2] || [];
                  
                  var sortedTweets = _.sortBy(tweets, function (t) { return -moment(t.created_at).valueOf(); });

                  var result =  {
                     user: user,
                     scored: calc.score(sortedTweets),
                     tweets: sortedTweets,
                     history: calc.scoreHistory(90, sortedTweets),
                     topics: cleanTopicText(piTopics.concat(kTopics)),
                     influencers: influencers,
                     bubble: calc.getBubbleData(sortedTweets)
                  };

                  res.end(JSON.stringify(result));
               });
            }
            else {
               res.writeHead(404);
               res.end(JSON.stringify(parsed));
            }
         }
         else {
            submitWorker(twitter_handle, function (err, id) {
               res.end(JSON.stringify({ processing: true, id: id, err: err }));
            });
         }
      });
   });

   app.get('/check/:task_id', function (req, res) {
      project.tasks.info(req.params.task_id, function (err, data) {
         res.setHeader('Content-Type', 'application/json');
         res.end(JSON.stringify(data));
      });
   });
}
