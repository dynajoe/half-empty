var requestUrl = 'https://api.peerindex.com/1/actor/topic';
var request = require('request');
var _ = require('underscore');

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
      if (!data.topics) data.topics = [];

      var topTopics = _.chain(data.topics)
         .sortBy(function (t) { return -t.topic_score; })
         .first(10)
         .value();

      for (var i = 0; i < topTopics.length; i++) {
         var topic = topTopics[i];
         topics.push({ text: topic.name, weight: topic.topic_score});
      };

      return cb(null, topics);
   });
}