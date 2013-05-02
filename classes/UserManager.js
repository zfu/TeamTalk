var Exception = require("./Exception");

var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	status : String,
	lastvisit : { type: Date, default: Date.now },
	creationdate : { type: Date, default: Date.now }
});
var UserModel = mongoose.model("users", UserSchema);


var UserManager = function () {

}

UserManager.prototype = {

	LOGIN_FAILED 	 : "Username and password don't match.",
	LOGIN_EXISTS 	 : "Username already exists.",
	SIGNUP_FAILED 	 : "Username and password don't match.",
	ERROR_LIST_USERS : "An error occurred while getting users.",
	NO_USERS 		 : "No users found.",

	login : function (username, password, success, fail) {

		UserModel.find({username : username, password : password}, null, function (err, result) {
			if (result.length == 1) {
				if (typeof success == "function") {
					success(result[0]);
				}
			} else {
				if (typeof fail == "function") {
					console.log("login failed : ");
					fail(new Exception(UserManager.prototype.LOGIN_FAILED));
				}
			}
		});
	},

	signup : function (username, password, success, fail) {

		UserModel.find({username : username}, {username:1}, function (err, result) {
			if (result.length > 0) {
				if (typeof fail == "function") {
					fail(new Exception(UserManager.prototype.LOGIN_EXISTS));
				}
				return;
			} else {
				var object = {
					username : username,
					password : password,
					status : "offline"
				};
				var user = new UserModel(object);
				user.save(function (err) {
					if (err) {
						if (typeof fail == "function") {
							fail(new Exception(UserManager.prototype.SIGNUP_FAILED));
						}
					} else {
						if (typeof success == "function") {
							success();
						}
					}
				});
			}
		});
	},

	logout : function (uid) {
		UserModel.find({_id : uid}, {password:0}, function (err, result) {
			if (result.length == 1) {
				var user = result[0];
				user.status = "offline";
				user.lastvisit = new Date();
				user.save();
			}
		});
	},

	getUsersList : function (params, fn) {
		UserModel.find(null, {username : 1, status : 1, lastvisit : 1}, function (err, result) {
			if (err) {
				fn(err);
			} else {
				fn(null, result);
			}
		});
	},

	/**
	 * Returns specified user
	 * @param uid
	 * @param fn
	 */
	getUserById : function (uid, fn) {
		UserModel.find({_id : uid}, {password : 0}, function (err, result) {
			if (!err && result.length > 0) {
				fn(null, result[0]);
			} else if (!err && result.length == 0) {
				fn(new Exception("User not found."));
			} else {
				fn(err);
			}
		});
	}
}

module.exports = UserManager;