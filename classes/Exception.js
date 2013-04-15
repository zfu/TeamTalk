Exception = function (message) {
	console.log("new Exception ("+message+")");
	this.message = message;
}

Exception.prototype = {

	message : "",

	getMessage : function () {
		console.log("getMessage:" + this.message);
		return this.message;
	},

	toString : function () {
		return "Exception: " + this.message;
	}
}