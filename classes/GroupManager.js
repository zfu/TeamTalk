var Exception = require("./Exception"),
	Util = require("./Util");

/**
 * Group model declaration
 */
var GroupSchema = new mongoose.Schema({
	name : String,
	key : String,
	members : Array,
	canmanage : Array,
	creationdate : {type: Date, default: Date.now}
});
GroupSchema.methods.addMember = function (member) {
	var index = Util.arrayItemIndex(this.members, member);
	if (index === null) {
		this.members.push(member);
		return true;
	} else {
		return false;
	}
};
GroupSchema.methods.removeMember = function (member) {
	var index = Util.arrayItemIndex(this.members, member);
	if (index !== null) {
		this.removeCanManage(member);
		delete this.members[index];
		return true;
	} else {
		return false;
	}
};
GroupSchema.methods.addCanManage = function (member) {
	var index = Util.arrayItemIndex(this.canmanage, member);
	if (index === null) {
		this.canmanage.push(member);
		return true;
	} else {
		return false;
	}
};
GroupSchema.methods.removeCanManage = function (member) {
	var index = Util.arrayItemIndex(this.canmanage, member);
	if (index !== null) {
		delete this.canmanage[index];
		return true;
	} else {
		return false;
	}
};
var GroupModel = mongoose.model("groups", GroupSchema);


/**
 * Manager for group data
 * @class GroupManager
 * @constructor
 */
var GroupManager = function () {

};

GroupManager.prototype = {

	createGroup : function (group, fn) {
		if (!group.key || !group.name) {
			fn(new Exception('error', "Data missing."));
			return;
		}
		// TODO: test if key exists
		this.getGroupByKey(group.key, function (err, result) {
			if (err) {
				fn(new Exception("An error occurred."));
				return;
			} else if (result.length > 0) {
				fn(new Exception("Group key already exists."));
				return;
			}
			var object = {
				name : group.name,
				key : group.key
			};
			var newgroup = new GroupModel(object);
			// save the group and returns it with id
			newgroup.save(fn);
		});
	},

	updateGroup : function (data, fn) {
		this.getGroupById(data.id, function (err, group) {
			if (err) {
				fn(new Exception("An error occurred."));
				return;
			}
			if (data.name) group.name = data.name;
			if ("members" in data) {
				for (var member in data.members) {
					if (data.members[member] === true) {
						group.addMember(member);
					} else if (data.members[member] === false) {
						group.removeMember(member);
					}
				}
			}
			if ("canmanage" in data) {
				for (var member in data.canmanage) {
					if (data.canmanage[member] === true) {
						group.addCanManage(member);
					} else if (data.canmanage[member] === false) {
						group.removeCanManage(member);
					}
				}
			}
			group.save(fn);
		});
	},

	getGroupById : function (id, fn) {
		GroupModel.find({_id : id},  fn);
	},

	getGroupByKey : function (key, fn) {
		GroupModel.find({key : key},  fn);
	}

};

module.exports = GroupManager;