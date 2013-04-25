require("./Exception");

var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	status : String,
	lastvisit : Date,
	creationdate : Date
});
UserModel = mongoose.model("users", UserSchema);


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
					status : "offline",
					lastvisit : new Date(),
					creationdate : new Date()
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

	getUsersList : function (params, success, fail) {

		UserModel.find(null, {username:1, status:1, lastvisit:1}, function (err, result) {
			if (err) {
				// an error occurred
				if (typeof fail == "function") {
					fail(new Exception(UserManager.prototype.ERROR_LIST_USERS));
				}
			} else if (result.length > 0) {
				// request successful
				if (typeof success == "function") {
					success(result);
				}
			} else {
				// request successful but no result
				if (typeof fail == "function") {
					fail(new Exception(UserManager.prototype.NO_USERS));
				}
			}
		});
	},

	getUserById : function (uid, callback) {
		UserModel.find({_id:uid}, {password:0}, function (err, result) {
			if (!err && result.length == 1) {
				callback(result[0]);
			}
		});
	}
}

module.exports = UserManager;