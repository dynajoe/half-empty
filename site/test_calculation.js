var ironio = require('node-ironio')('nfFVh41-R6ZkFU0SzGOgzJM9JCk')
  , project = ironio.projects('51bbd144ed3d766cf3000ab6')
  , cache = project.caches('twitter')
  , moment = require('moment');

var twitter_handle = 'smerchek';
      
cache.get(twitter_handle, function (err, data) {
   //console.log(JSON.stringify(require('./lib/calculate').score(JSON.parse(data)).overallScore, null, 2));
   console.log(JSON.stringify(require('./lib/calculate').scoreFromDate(moment().subtract('days', 90), JSON.parse(data)).overallScore, null, 2));
});