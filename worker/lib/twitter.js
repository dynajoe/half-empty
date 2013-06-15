
var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: '6F9g1bQtl8l14AkJzBgw',
  consumer_secret: 'ix9O34lNgaVqIk6TJvKp5AZbeboMDF8MxBEIl8WtIQ',
  access_token_key: '49359644-yJBynxQGA5eYEpAwcOq8RzWP9X0gUIOnNPOaEBeH4',
  access_token_secret: 'etIdekP6F3vAse8iD3K5nxKSQHyJZN8xiCbGLIIls'
});

module.exports.getTweets = function(handle, cb) {
   twit.getUserTimeline({
      screen_name: handle,
      count: 5
   }, function(err, data) {
      if (err) return cb(err);

      cb(null, data);
   });
}