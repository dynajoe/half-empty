var requestUrl = 'https://api.peerindex.com/1/actor/topic';
var request = require('request');

module.exports.getTopics = function(handle, cb) {
   var topics = [];
   request.get({
      url: requestUrl,
      qs: {
         api_key: 'gpvuxvef3zme97b25phq95z5',
         twitter_screen_name: handle
      },
      json: true
   }, function(err, res, data) {
      if (err) return cb(err);

      for (var i = 0; i < data.topics.length; i++) {
         var topic = data.topics[i];
         topics.push({ text: topic.name, weight: topic.topic_score});
      };

      return cb(null, topics);
   });
}