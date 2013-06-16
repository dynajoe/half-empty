var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk'),
   project = ironio.projects('51bbd144ed3d766cf3000ab6'),
   cache = project.caches('twitter'),
   _ = require('underscore'),
   calc = require('../lib/calculate'),
   peerindex = require('../lib/peerindex');

var submitWorker = function (twitter_handle, callback) {
   project.tasks.queue({ code_name: 'scorer', payload: JSON.stringify({ handle: twitter_handle }) }, function (err, res) {
      console.log(arguments);
      console.log('Worker submitted');
   });
};

var checkTaskStatusORQueue = function (twitter_handle, callback) {
   project.tasks.list(function (err, tasks) {
      var task = _.chain(tasks)
         .where({ code_name: 'scorer' })
         .find(function (t) { 
            return JSON.parse(t.payload).handle != twitter_handle; 
         })
         .value();

      if (!task) {
         submitWorker(twitter_handle);
         callback('Queued');
      } else {
         callback('In Progress')
      }
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
      
      cache.get(twitter_handle, function (err, data) {
         if (data) {
            var tweets = JSON.parse(data);
            var result;

            if (tweets) {
               peerindex.getTopics(twitter_handle, function(err, topics) {
                  result =  {
                     user: tweets[0].user,
                     scored: calc.score(tweets),
                     tweets: tweets,
                     history: calc.scoreHistory(90, tweets),
                     topics: topics
                  };

                  res.end(JSON.stringify(result));
               });
            }
            else {
               res.end("");
            }
         }
         else {
            checkTaskStatusORQueue(twitter_handle, function (status) {
               res.end(JSON.stringify({ processing: true }));
            });
         }
      });
   });
}