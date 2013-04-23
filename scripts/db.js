mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/teamtalk', function(err) {
  if (err) { throw err; }
});

/**
 * User
 */
var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	status : String,
	lastvisit : Date,
	creationdate : Date
});
UserModel = mongoose.model("users", UserSchema);

/**
 * Chat
 */
var ChatSchema = new mongoose.Schema({
	message : String,
	author : String,
	room : String,
	creationdate : Date
});
ChatModel = mongoose.model("chats", ChatSchema);

