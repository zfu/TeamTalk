/**
 *
 * @class Util
 */
var Util;
Util = {

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