
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
//var partials = require('express-partials');

var MongoStore = require("connect-mongo")(express);
var settings = require('./settings');


//var app = express();
var app = express.createServer();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  //app.use(partials());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use(express.cookieParser());
  app.use(express.session({
	  secret : settings.cookieSecret,
	  Store : new MongoStore({
		  db : settings.db
	  })
  }));
  app.use(express.router(routes));
  //app.use(app.router);
  
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/u/:users', routes.user);
app.post('/post',routes.post);

app.get('/.reg',routes.reg);
app.post('/reg',routes.doReg);
app.get('/login',routes.login);
app.post('/login',routes.doLogin);
app.get('/logout',routes.logout);

app.listen(3000, function(){
  console.log("Express server listening on port " + app.get('port'));
});
