var request = require('request');
var klout_key = 'fcyfpnv9xdxrk2jrsyvgqasb';

var getId = function (twitter_handle, callback) {
   request.get({ 
      url: 'http://api.klout.com/v2/identity.json/twitter',
      qs: {
         screenName: twitter_handle,
         key: klout_key
      },
      json: true
   }, function (err, res, data) {
      callback(null, data.id);
   });
}

module.exports = (function () {
   return {
      getTopics: function (twitter_handle, callback) {
         getId(twitter_handle, function (err, id) {
            request.get({
               url: 'http://api.klout.com/v2/user.json/' + id + '/topics',
               qs: { 
                  key: klout_key
               },
               json: true
            }, function (err, res, data) {

               var topics = [];

               for (var i = 0; i < data.length; i++) {
                  var topic = data[i];
                  topics.push({ text: topic.displayName, weight: 1 });
               }

               callback(null, topics);
            });
         });
      }
   }
})();