var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , cache = project.caches('twitter')
  , request = require('request');

cache.info(function(err, res) {
   console.log('Conneted to cache: ' + JSON.stringify(res));
});

console.log('Scoring Worker');