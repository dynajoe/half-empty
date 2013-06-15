var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , cache = project.caches('twitter');

var twitter_handle = 'smerchek';
      
cache.get(twitter_handle, function (err, data) {
   console.log(JSON.stringify(require('./lib/calculate').score(JSON.parse(data)), null, 2));
});