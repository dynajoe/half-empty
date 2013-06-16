var express = require('express'),
   app = express(),
   server = require('http').createServer(app),
   path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('connect-assets')())
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.bodyParser());

require('./controllers/home')(app);
require('./controllers/analyze')(app);

server.listen(app.get('port'));
console.log('App listening on port ' + app.get('port'));
