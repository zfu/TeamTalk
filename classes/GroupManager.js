var GroupSchema = new mongoose.Schema({
	name : String,
	key : String,
	members : Array,
	caninvite : Array,
	creationdate : Date
});
var GroupModel = mongoose.model("groups", GroupSchema);


var GroupManager = function () {

};

GroupManager.prototype = {

	addGroup : function (group, fn) {
		// TODO: add request
		// TODO: get added element and return
	},

	editGroup : function (group, fn) {
		// TODO: edit request
		// TODO: get updated element and return
	},

	getGroupById : function (id, fn) {
		// TODO: get group and return
	}

};

module.exports = GroupManager;