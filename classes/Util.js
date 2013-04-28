/**
 *
 * @class Util
 */
var Util;
Util = {

	/**
	 * Plug listener to socket event
	 * @param socket
	 * @param event
	 * @param method
	 * @param instance
	 * @deprecated use Util.Socket.bind
	 */
	socketBind : function (socket, event, method, instance) {
		socket.on(event, function () {
			var params = [socket];
			for (var i = 0; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			method.apply(instance, params);
		});
	},

	/**
	 * Checks if arr contains item
	 * @param arr
	 * @param item
	 * @returns {boolean|number}
	 */
	arrayItemIndex : function (arr, item) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === item)
				return i;
		}
		return null;
	}
};

Util.Socket = require("./Util/Socket");

module.exports = Util;