module.exports = function (app) {
   app.get('/analyze', function (req, res) {
      var twitter_handle = req.query.twitter_handle;
      
      res.write(JSON.stringify({ processing: true }));
      res.end();
   });
}