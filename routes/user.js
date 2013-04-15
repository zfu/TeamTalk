/*
 * GET users listing.
 */
exports.list = function(req, res){
	UserModel.find(null, {username:1}, function (err, result) {
		console.log(result);
		res.render('users', { users: result });
	});
};

/*
 * Sign up form
 */
exports.signup = function(req, res){
	res.render('signup');
};
exports.signup_process = function (req, res) {
	var params = req.body;
	console.log(params);
	
	var object = {
		username : params.username,
		password : params.password
	};
	
	var user = new UserModel(object);
	user.save(function (err) {
		if (err) throw err;
		else res.redirect('/users');
	});
};

/*
 * Login form
 */
exports.login = function(req, res){
	res.render('login');
};
exports.login_process = function(req, res){
	var params = req.body;
	
	UserModel.find({username : params.username, password : params.password}, {username:1}, function (err, result) {
		console.log(result);
		if (result.length == 1)
			res.redirect('/users');
		else 
			res.render('login', { error: "Erreur de login" });
	});
};