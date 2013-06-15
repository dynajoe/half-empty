var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , cache = project.caches('twitter')
  , request = require('request');

var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: '6F9g1bQtl8l14AkJzBgw',
  consumer_secret: 'ix9O34lNgaVqIk6TJvKp5AZbeboMDF8MxBEIl8WtIQ',
  access_token_key: '49359644-yJBynxQGA5eYEpAwcOq8RzWP9X0gUIOnNPOaEBeH4',
  access_token_secret: 'etIdekP6F3vAse8iD3K5nxKSQHyJZN8xiCbGLIIls'
});

cache.info(function(err, res) {
   console.log('Conneted to cache: ' + JSON.stringify(res));
});

console.log('Scoring Worker');

require('./lib/payload_parser').parse_payload(process.argv, function (payload) {
   if(!payload.handle) {
      console.error('No twitter handle defined.');
      process.exit(1);
   }
   twit.getUserTimeline({
      screen_name: payload.handle,
      count: 5
   }, function(err, data) {
      console.log(JSON.stringify(data, null, 2));
   });
});