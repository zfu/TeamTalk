
var SocketServices = function (express, socket) {
	this._express = express;
	this._socket  = socket;
	this._modules = {};
	this.init();
};

SocketServices.prototype = {

	_express : null,
	_socket  : null,
	_modules : null,

	init : function () {
		this.connect();
	},

	connect : function () {
		this._socket.on('service', this.service);
	},

	addModule : function (modulePath, moduleName) {
		this._modules[moduleName] = require(modulePath);
	},

	service : function (path, params) {
		var pathRegExp = /^([a-z]+)\/([a-z]+)/i;
		var parts = pathRegExp.exec(path);
		if (!parts) {
			this._socket.emit('error', 'Unknown service.');
			return;
		}
		var module = parts[1];
		var method = parts[2];

		if (module in this._modules) {
			this._modules[module][method].call(this._modules[module], path, params);
		} else {
			this._socket.emit('error', 'Unknown service.');
		}
	}
};

module.exports = SocketServices;