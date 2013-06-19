module.exports = function (app) {
   app.get('/', function (req, res) {
      if (!req.user) {
         return res.render('signin');
      }
      res.render('index');
   });
   app.get('/about', function (req, res) {
      res.render('about');
   });
};