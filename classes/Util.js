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
		if (!instance) instance = this;

		socket.on(event, function () {
			var params = [socket];
			for (var i = 0; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			method.apply(instance, params);
		});
	}

};

module.exports = Util;