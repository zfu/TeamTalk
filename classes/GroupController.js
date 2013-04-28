
var utilSocket = require("./Util").Socket,
	GroupManager = require("./GroupManager"),
	ejs = require("ejs");

/**
 * Controller for group features
 * @constructor
 * @class GroupController
 */
var GroupController = function () {
	this._manager = new GroupManager();
};

GroupController.prototype = {

	/**
	 * Manager to use for manage groups data
	 * @type GroupManager
	 */
	_manager : null,

	/**
	 * Binds methods on socket events
	 * @param socket
	 */
	plugSocket : function (socket) {
		// grouphome
		utilSocket.bind(socket, "grouphome", this.onGroupHome, this);
		// groupform
		utilSocket.bind(socket, "groupform", this.onGroupForm, this);
		// addgroup
		utilSocket.bind(socket, "addgroup", this.onAddGroup, this);
		// editgroup
		utilSocket.bind(socket, "editgroup", this.onEditGroup, this);
		// group
		utilSocket.bind(socket, "group", this.onGroup, this);
	},

	/**
	 * Called when socket receives the "grouphome" event
	 * Emits group home data
	 * @param socket
	 * @param data
	 */
	onGroupHome : function (socket, data) {
		ejs.renderFile("./views/groupform.ejs", function (err, html) {
			socket.emit("groupform", {html : html});
		});
	},

	/**
	 * Called when socket receives the "groupform" event
	 * Emits group form in html
	 * @param socket
	 */
	onGroupForm : function (socket) {
		ejs.renderFile("./views/groupform.ejs", function (err, html) {
			socket.emit("groupform", {html : html});
		});
	},

	/**
	 * Called when socket receives the "addgroup" event
	 * Emits group data in html
	 * @param socket
	 * @param data
	 */
	onAddGroup : function (socket, data) {
		var that = this;
		this._manager.createGroup(data, function (err, group) {
			if (err) {
				socket.emit('error', err.getMessage());
			} else {
				that.emitGroup(socket, group);
			}
		});
	},

	/**
	 * Called when socket receives the "editgroup" event
	 * Emits group data in html
	 * @param socket
	 * @param data
	 */
	onEditGroup : function (socket, data) {
		var that = this;
		this._manager.updateGroup(data, function (err, group) {
			that.emitGroup(socket, group);
		});
	},

	/**
	 * Called when socket receives the "group" event
	 * Emits group data in html
	 * @param socket
	 * @param data
	 */
	onGroup : function (socket, data) {
		this.emitGroupById(socket, data.id);
	},

	/**
	 * Emits group data in html
	 * @param socket
	 * @param id
	 */
	emitGroupById : function (socket, id) {
		var that = this;
		this._manager.getGroupById(id, function (err, group) {
			that.emitGroup(socket, group);
		});
	},

	/**
	 * Emits group data in html
	 * @param socket
	 * @param group
	 */
	emitGroup : function (socket, group) {
		ejs.renderFile("./views/groupdetails.ejs", {group : group}, function (err, html) {
			socket.emit("group", {html : html, group : group});
		});
	}

};

module.exports = GroupController;