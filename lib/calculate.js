var moment = require('moment')
  , _ = require('underscore'),
  child_process = require('child_process');

module.exports.history = function(numberOfDays, twitter_handle, callback) {
   return doChildWork('history', [twitter_handle, numberOfDays], callback);
};

module.exports.score = function(twitter_handle, callback) {
   return doChildWork('score', twitter_handle, callback);
};

module.exports.getBubbleData = function (twitter_handle, callback) {
   return doChildWork('getBubbleData', twitter_handle, callback);
};

var doChildWork = function (method, arguments, callback) {
   var child = child_process.spawn('node', ['scorer.js', method].concat(arguments));
   var output = '';

   child.stdout.on('data', function (data) {
      output += data.toString();
   });

   child.on('close', function (code) {
      if (code == 0) {
         callback(null, JSON.parse(output));
      } else {
         callback(new Error(output));
         console.log('Child process exited with code ' + code + '\n' + output);
      }
   });
};