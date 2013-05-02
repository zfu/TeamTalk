



var ChatSchema = new mongoose.Schema({
	message : String,
	author : String,
	room : String,
	creationdate : Date
});
var ChatModel = mongoose.model("chats", ChatSchema);


/**
 *
 * @constructor
 * @class ChatManager
 */
var ChatManager = function () {

};

ChatManager.prototype = {

};

module.exports = ChatManager;