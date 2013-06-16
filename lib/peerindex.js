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
      console.log(err);
      console.log(data);

      if (err) return cb(err);
      if (!data.topics) data.topics = [];


      for (var i = 0; i < data.topics.length; i++) {
         var topic = data.topics[i];
         topics.push({ text: topic.name, weight: topic.topic_score});
      };

      return cb(null, topics);
   });
}