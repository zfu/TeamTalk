/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie
	, cookie = require('express/node_modules/cookie');

require('./scripts/db');
//require('messenger');

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
//app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});

var application = require("./classes/Application");
application.setConfig({
	express : app
});

io = require('socket.io').listen(server);
/*
io.sockets.authorization(function (handshakeData, callback) {
	var cookies = cookie.parse(handshakeData.headers.cookie);
	var sid = parseSignedCookie(cookies['connect.sid'], app.secretKey);
	if (!sid) {
		callback("No sessionID", false);
		return;
	}
	handshakeData.sessionID = sid;
	app.sessionStore.get(sid, function (err, session) {
		if (!err && session && session.username) {
			handshakeData.username = session.username;
			callback(null, true);
		} else {
			callback(err || "User not authenticated", false);
		}
	});
});
*/
io.sockets.on('connection', function (socket) {
	//Messenger.plugSocket(socket);
	application.initSocket(socket);
});