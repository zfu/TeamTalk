
var utilSocket = require("./Util").Socket,
	ChatManager = require("./ChatManager"),
	ejs = require("ejs");

/**
 *
 * @constructor
 * @class ChatController
 * @param app
 */
var ChatController = function (app) {
	if (app) this._application = app;
	this._manager = new ChatManager();
	this._rooms = {};
};

ChatController.prototype = {

	/**
	 * Manager to use for manage groups data
	 * @type ChatManager
	 */
	_manager : null,

	/**
	 * Reference to application
	 * @type Application
	 */
	_application : null,

	/**
	 * Rooms list
	 * @type object
	 */
	_rooms : null,

	/**
	 * Binds methods on socket events
	 * @param socket
	 */
	plugSocket : function (socket) {
		utilSocket.bind(socket, "newchat", this.onNewChat, this);
		utilSocket.bind(socket, "chatmsg", this.onChatMessage, this);
	},


	/**
	 * Called when socket receives "newchat"
	 * @param socket
	 * @param data
	 */
	onNewChat : function (socket, data) {
		var sid = socket.handshake.sid;
		if (!sid) {
			socket.emit('error', "Cannot load chat room. Session id error.");
			return;
		}
		if (!(data.room in this._rooms)) {
			this._rooms[data.room] = {};
		}
		this._rooms[data.room][sid] = socket;

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
	onChatMessage : function (socket, data) {
		var that = this;
		this._application._userController.getUserBySocket(socket, function (err, user) {
			if (!err) {
				var message = {
					text : data.message,
					author : user.username,
					time : new Date(),
					room : data.room
				};
				// TODO: save in db
				var room = that._rooms[message.room];
				for (var id in room) {
					room[id].emit("chatmsg", message);
				}
			} else {
				socket.emit("error", err.getMessage());
			}
		});
	}
};

module.exports = ChatController;