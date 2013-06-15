var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , cache = project.caches('twitter');
var _ = require('underscore');
var inProgress = {};

var submitWorker = function (twitter_handle, callback) {
   project.tasks.queue({ code_name: 'scorer', payload: JSON.stringify({ handle: twitter_handle }) }, function (err, res) {
      console.log(arguments);
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
}
module.exports = function (app) {
   app.get('/analyze/:handle', function (req, res) {
      res.setHeader('Content-Type', 'application/json');
               
      var twitter_handle = req.params.handle;
      
      cache.get(twitter_handle, function (err, data) {
         if (data) {
            res.end(JSON.stringify(JSON.parse(data)));
         }
         else {
            checkTaskStatusORQueue(twitter_handle, function (status) {
               res.end(JSON.stringify({processing: true}));
            });
         }
      });
   });
}