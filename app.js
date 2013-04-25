/**
 * Module dependencies.
 */
var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.secretKey = "secret";
app.use(express.cookieParser(app.secretKey));
app.sessionStore = new express.session.MemoryStore({ reapInterval: 60000 * 10 });
app.use(express.session({
	secret : app.secretKey,
	store : app.sessionStore,
	expires : new Date(Date.now()+96*3600*1000)
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});

// db connect, mongoose var must be global
mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/teamtalk', function(err) {
	if (err) { throw err; }
});

var application = require("./classes/Application");
application.setConfig({
	express : app
});

io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
	application.initSocket(socket);
});