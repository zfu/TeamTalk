
var TopicManager = require("./TopicManager"),
	utilSocket = require("./Util").Socket,
	ejs = require("ejs");

/**
 *
 * @constructor
 * @class TopicController
 * @param app
 */
var TopicController = function (app) {
	if (app) this._application = app;
	this._manager = new TopicManager();
};

TopicController.prototype = {

	/**
	 * Manager to use
	 * @type TopicManager
	 */
	_manager : null,

	/**
	 * Reference to application
	 * @type Application
	 */
	_application : null,

	/**
	 * Connect listeners to socket events
	 * @param socket
	 */
	plugSocket : function (socket) {
		// listen the topics page
		utilSocket.bind(socket, "topics", this.onTopics, this);
		// listen the topic form
		utilSocket.bind(socket, "topicform", this.onTopicForm, this);
		// listen new topic
		utilSocket.bind(socket, "newtopic", this.onNewTopic, this);
		// listen new topic
		utilSocket.bind(socket, "topic", this.onTopic, this);
	},

	/**
	 * Called when socket receives "newtopic"
	 * Emits the created topic in html
	 * @param socket
	 * @param data
	 */
	onNewTopic : function (socket, data) {
		// TODO : save topic
		//this.sendTopic(id);
		console.log("onNewTopic");
	},

	/**
	 * Called when socket receives "topicform"
	 * Emits html form for a new topic
	 * @param socket
	 * @param data
	 */
	onTopicForm : function (socket, data) {
		// return topic form
		ejs.renderFile("./views/topicform.ejs", function (err, html) {
			socket.emit("topicform", {html : html});
		});
	},

	/**
	 * Called when socket receives "topics"
	 * Emits html with the matching topics
	 * @param socket
	 * @param data
	 */
	onTopics : function (socket, data) {
		var callback = function (err, topics) {
			ejs.renderFile("./views/topicslist.ejs", {topics : topics}, function (err, html) {
				socket.emit("topics", {html : html});
			});
		}
		if ("tag" in data && data.tag) {
			this._manager.getTopicsByTag(data.tag, callback);
		} else if ("last" in data && data.last) {
			this._manager.getLastTopics(callback);
		}
		console.log("onTopics");
	},

	/**
	 * Called when socket receives "topic"
	 * Emits html with the matching topic
	 * @param socket
	 * @param data
	 */
	onTopic : function (socket, data) {
		this.sendTopic(data.id);
	},

	/**
	 * Emits html with the matching topic
	 * @param id
	 */
	sendTopic : function (id) {
		this._manager.getTopicById(id, function (err, topic) {
			ejs.renderFile("./views/topicform.ejs", {topic : topic}, function (err, html) {
				socket.emit("topic", {html : html});
			});
		});
	}
};

module.exports = TopicController;