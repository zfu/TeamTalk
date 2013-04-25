/**
 *
 * @class Util.Socket
 */
var Socket = {

	/**
	 * Add listener to socket event
	 * @param socket
	 * @param event
	 * @param method
	 * @param instance
	 */
	bind : function (socket, event, method, instance) {
		socket.on(event, function () {
			var params = [socket];
			for (var i = 0; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			method.apply(instance, params);
		});
	}

};

module.exports = Socket;