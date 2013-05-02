var Util = require("./Util"),
	UserController = require("./UserController"),
	GroupController = require("./GroupController"),
	ChatController = require("./ChatController"),
	TopicController = require("./TopicController"),
	ejs = require("ejs");


var Application = function () {
	this._userController = new UserController(this);
	this._topicController = new TopicController(this);
	this._chatController = new ChatController(this);
	this._groupController = new GroupController(this);
};

Application.prototype = {

	_express : null,
	_topicController : null,
	_groupController : null,
	_userController : null,
	_chatController : null,

	/**
	 * Configure application
	 * @param config
	 */
	setConfig : function (config) {
		if (config.express) this._express = config.express;
	},

	/**
	 * Connect listeners to socket events
	 * If user not found in session, send login form
	 * @param socket
	 */
	initSocket : function (socket) {
		this._userController.plugSocket(socket);
		this._groupController.plugSocket(socket);
		this._chatController.plugSocket(socket);
		this._topicController.plugSocket(socket);
	},

	/**
	 * Retourne l'instance d'express
	 * @returns {object}
	 */
	getExpress : function () {
		return this._express;
	}
}

module.exports = new Application();