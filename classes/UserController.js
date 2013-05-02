
var utilSocket = require("./Util").Socket,
	UserManager = require("./UserManager"),
	cookie = require("express/node_modules/cookie"),
	parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie,
	ejs = require("ejs");

/**
 * Controller for user features
 * @constructor
 * @class UserController
 * @param app
 */
var UserController = function (app) {
	if (app) this._application = app;
	this._manager = new UserManager();
};

UserController.prototype = {

	/**
	 * Manager to use for manage groups data
	 * @type UserManager
	 */
	_manager : null,

	/**
	 * Reference to application
	 * @type Application
	 */
	_application : null,

	/**
	 * Binds methods on socket events
	 * @param socket
	 */
	plugSocket : function (socket) {
		utilSocket.bind(socket, "login", this.onLogin, this);
		utilSocket.bind(socket, "signup", this.onSignup, this);
		utilSocket.bind(socket, "logout", this.onLogout, this);
		utilSocket.bind(socket, "disconnect", this.onDisconnect, this);
		utilSocket.bind(socket, "userslist", this.onUsersList, this);
		utilSocket.bind(socket, "usernames", this.onUsernames, this);

		var that = this;
		this.getSession(socket, function (err, session) {
			if (!err && session && session.uid) {
				that._manager.getUserById(session.uid, function (user) {
					that.setUserOnline(user, function () {
						that.sendConnectedArea(socket, user);
					});
				});
			} else {
				that.sendLoginForm(socket);
			}
		});
	},

	/**
	 * Send login form to client
	 * @param socket
	 */
	sendLoginForm : function (socket) {
		ejs.renderFile("./views/loginform.ejs", function (err, html) {
			socket.emit('login', {connected : false, html : html});
		});
	},

	/**
	 * Sends connected user area to client
	 * @param socket
	 * @param user
	 */
	sendConnectedArea : function (socket, user) {
		ejs.renderFile("./views/userarea.ejs", {username : user.username}, function (err, html) {
			socket.emit('login', {connected : true, html : html});
		});
	},

	/**
	 * Called when socket receives "login"
	 * Connect user
	 * @param socket
	 * @param username
	 * @param password
	 */
	onLogin : function (socket, username, password) {
		var that = this;
		this._manager.login(
			username,
			password,
			function (user) {
				// connection successful
				socket.emit("notify", "You are connected.");
				that.setUserCookie(socket, user, function () {
					// set user online
					that.setUserOnline(user, function () {
						that.sendConnectedArea(socket, user);
					});
				});
			},
			function (e) {
				socket.emit("error", e.getMessage());
			}
		);
	},

	/**
	 * Called when socket receives "signup"
	 * Creates user account
	 * @param socket
	 * @param username
	 * @param password
	 */
	onSignup : function (socket, username, password) {
		this._manager.signup(
			username,
			password,
			function () {
				socket.emit("notify", "Signup successful");
			},
			function (e) {
				socket.emit("error", e.getMessage());
			}
		);
	},

	/**
	 * Called when socket receives "logout"
	 * Disconnect user in db
	 * @param socket
	 */
	onLogout : function (socket) {
		var that = this;
		this._manager.logout(socket.handshake.uid);
		//TODO: leave chat room
		delete socket.handshake.uid;
		this.getSession(socket, function (err, session) {
			if (!err && session && session.uid) {
				delete session.uid;
				that.express.sessionStore.set(socket.handshake.sid, session);
			}
		});
		this.sendLoginForm(socket);
	},

	/**
	 * Called when socket receives "disconnect"
	 * @param socket
	 */
	onDisconnect : function (socket) {
		this._manager.logout(socket.handshake.uid);
	},


	/**
	 * Called when socket receives "userslist"
	 * Send users list to client
	 * @param socket
	 * @param params
	 */
	onUsersList : function (socket, params) {
		this._manager.getUsersList(params, function (err, users) {
				if (err) {
					socket.emit("error", err.getMessage());
				} else {
					ejs.renderFile("./views/userslist.ejs", {users : users}, function (err, html) {
						socket.emit("userslist", {html : html});
					});
				}
			}
		);
	},

	onUsernames : function (socket, params) {
		//TODO: liste des noms d'utilisateur fitrés par début de chaîne
	},

	/**
	 * Set user in cookies
	 * @param socket
	 * @param user
	 * @param callback
	 */
	setUserCookie : function (socket, user, callback) {
		var that = this;
		this.getSession(socket, function (err, session) {
			if (!err && session) {
				session.uid = user._id;
				that._application.getExpress().sessionStore.set(socket.handshake.sid, session, function () {
					socket.handshake.uid = user._id;
					callback();
				});
			}
		});
	},

	/**
	 * Set user online in db
	 * @param user
	 * @param callback
	 */
	setUserOnline : function (user, callback) {
		user.status = "online";
		user.lastvisit = new Date();
		user.save(function (err, user) {
			if (callback) callback();
		});
	},

	/**
	 * Returns user session by his socket
	 * @param socket
	 * @param fn
	 */
	getSession : function (socket, fn) {
		var sid = socket.handshake.sid;
		if (!sid) {
			var cookies = cookie.parse(socket.handshake.headers.cookie);
			sid = parseSignedCookie(cookies['connect.sid'], this._application.getExpress().secretKey);
			socket.handshake.sid = sid;
		}
		this._application.getExpress().sessionStore.get(sid, fn);
	},

	/**
	 * Returns user by his socket
	 * @param socket
	 * @param fn
	 */
	getUserBySocket : function (socket, fn) {
		var that = this;
		this.getSession(socket, function (err, session) {
			if (!err && session && session.uid) {
				that._manager.getUserById(session.uid, function (err, user) {
					fn(err, user);
				});
			} else {
				fn(err);
			}
		});
	}


};

module.exports = UserController;