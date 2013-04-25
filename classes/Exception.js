/**
 * Describes Exception
 * @constructor
 * @param message
 */
var Exception = function (message) {
	console.log("new Exception ("+message+")");
	this.message = message;
};

Exception.prototype = {

	/**
	 * Exception message
	 * @type String
	 */
	message : "",

	/**
	 * Returns exception message
	 * @return {String}
	 */
	getMessage : function () {
		return this.message;
	},

	/**
	 * Parses exception to string
	 * @returns {string}
	 */
	toString : function () {
		return "Exception: " + this.message;
	}
};

module.exports = Exception;