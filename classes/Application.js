var userManager = require("./UserManager");
var cookie = require("express/node_modules/cookie");
var parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie;
var ejs = require("ejs");


var Application = function () {
	this.chatRooms = {};
};

Application.prototype = {

	express : null,
	chatRooms : null,
	
	setConfig : function (config) {
		if (config.express) this.express = config.express;
	},
	
	/**
	 * Plug listener to socket event
	 * @param socket
	 * @param event
	 * @param method
	 * @param instance
	 */
	socketBind : function (socket, event, method, instance) {
		if (!instance) instance = this;

		socket.on(event, function () {
			var params = [socket];
			for (var i = 0; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			method.apply(instance, params);
		});
	},

	/**
	 * Connect listeners to socket events
	 * If user not found in session, send login form
	 * @param socket
	 */
	initSocket : function (socket) {
		var that = this;
		this.socketBind(socket, "login", this.onLogin);
		this.socketBind(socket, "signup", this.onSignup);
		this.socketBind(socket, "logout", this.onLogout);
		this.socketBind(socket, "disconnect", this.onDisconnect);
		this.socketBind(socket, "users", this.onUsers);
		this.socketBind(socket, "newchat", this.onNewChat);
		this.socketBind(socket, "chatmsg", this.onChatMessage);

		this.getSession(socket, function (err, session) {
			if (!err && session && session.uid) {
				userManager.getUserById(session.uid, function (user) {
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
		userManager.login(
			username,
			password,
			function (user) {
				// connection successful
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
		userManager.signup(
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
		userManager.logout(socket.handshake.uid);
		//TODO: leave chat room
		delete socket.handshake.uid;
		this.sendLoginForm(socket);
	},

	/**
	 * Called when socket receives "disconnect"
	 * @param socket
	 */
	onDisconnect : function (socket) {
		userManager.logout(socket.handshake.uid);
		//TODO: leave chat room
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
				//session.username = user.username;
				session.uid = user._id;
				that.express.sessionStore.set(socket.handshake.sid, session, function () {
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
	 * @param callback
	 */
	getSession : function (socket, callback) {
		var sid = socket.handshake.sid;
		if (!sid) {
			var cookies = cookie.parse(socket.handshake.headers.cookie);
			sid = parseSignedCookie(cookies['connect.sid'], this.express.secretKey);
			socket.handshake.sid = sid;
		}
		this.express.sessionStore.get(sid, callback);
	},

	/**
	 * Returns user by his socket
	 * @param socket
	 * @param callback
	 */
	getUserBySocket : function (socket, callback) {
		this.getSession(socket, function (err, session) {
			if (!err && session && session.uid) {
				userManager.getUserById(session.uid, function (user) {
					callback(user);
				});
			} else {
				// TODO: throw error
			}
		});
	},

	isConnected : function (socket) {
		//if ()
	},

	/**
	 * Called when socket receives "users"
	 * Send users list to client
	 * @param socket
	 * @param params
	 */
	onUsers : function (socket, params) {
		userManager.getUsersList(
			params,
			function (users) {
				ejs.renderFile("./views/userslist.ejs", {users:users}, function (err, html) {
					socket.emit("users", {html : html});
				});
			},
			function (e) {
				socket.emit("error", e.getMessage());
			}
		);
	},

	/**
	 * Called when socket receives "newchat"
	 * @param socket
	 */
	onNewChat : function (socket, data) {
		var sid = socket.handshake.sid;
		if (!sid) {
			socket.emit('error', "Cannot load chat room. Session id error.");
			return;
		}
		if (!(data.room in this.chatRooms)) {
			this.chatRooms[data.room] = {};
		}
		this.chatRooms[data.room][sid] = socket;

		// TODO: get messages from db from last 24h

		ejs.renderFile("./views/chatbox.ejs", {}, function (err, html) {
			socket.emit("newchat", {room:data.room, html : html});
		});
	},

	/**
	 * Called when socket receives "chatmsg"
	 * @param socket
	 * @param data
	 */
	onChatMessage : function (socket, params) {
		var that = this;
		this.getUserBySocket(socket, function (user) {
			var data = {
				message : params.message,
				from : user.username,
				time : new Date(),
				room : params.room
			};
			// TODO: save in db
			var room = that.chatRooms[data.room];
			for (var id in room) {
				room[id].emit("chatmsg", data);
			}
		});
	}
}

module.exports = new Application();