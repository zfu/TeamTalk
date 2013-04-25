/**
 *
 * @class Util
 */
var Util = {

	/**
	 * Plug listener to socket event
	 * @param socket
	 * @param event
	 * @param method
	 * @param instance
	 */
	socketBind : function (socket, event, method, instance) {
		socket.on(event, function () {
			var params = [socket];
			for (var i = 0; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			method.apply(instance, params);
		});
	}

};

Util.Socket = require("./Util/Socket");

module.exports = Util;