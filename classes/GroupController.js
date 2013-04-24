
var Util = require("./Util"),
	GroupManager = require("./GroupManager"),
	ejs = require("ejs");

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
		Util.socketBind(socket, "grouphome", this.onGroupHome, this);
		// groupform
		Util.socketBind(socket, "groupform", this.onGroupForm, this);
		// addgroup
		Util.socketBind(socket, "addgroup", this.onAddGroup, this);
		// editgroup
		Util.socketBind(socket, "editgroup", this.onEditGroup, this);
		// group
		Util.socketBind(socket, "group", this.onGroup, this);
	},

	/**
	 * Called when socket receives the "grouphome" event
	 * Emits group home data
	 * @param socket
	 * @param data
	 */
	onGroupHome : function (socket, data) {

	},

	/**
	 * Called when socket receives the "groupform" event
	 * Emits group form in html
	 * @param socket
	 * @param data
	 */
	onGroupForm : function (socket, data) {
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
		this._manager.addGroup(data, function (err, group) {
			that.emitGroup(socket, group._id);
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
		this._manager.editGroup(data, function (err, group) {
			that.emitGroup(socket, group._id);
		});
	},

	/**
	 * Called when socket receives the "group" event
	 * Emits group data in html
	 * @param socket
	 * @param data
	 */
	onGroup : function (socket, data) {
		this.emitGroup(socket, data.id);
	},

	/**
	 * Emits group data in html
	 * @param socket
	 * @param id
	 */
	emitGroup : function (socket, id) {
		this._manager.getGroupById(id, function (err, group) {
			ejs.renderFile("./views/groupdetails.ejs", {group : group}, function (err, html) {
				socket.emit("group", {html : html});
			});
		});
	}

};

module.exports = GroupController;