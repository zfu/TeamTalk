var socket = null;
var notifyTimer = null;
var notifyList = [];
var errorsList = [];

$(function () {
	socket = io.connect('http://'+window.location.host);

	socket.on('error', function (message) {
		error(message);
	});

	socket.on('notify', function (message) {
		notify(message);
	});

	socket.on('login', function (data) {
		if (data.connected) {
			$(".login-form-area").remove();
			tabContent("logout-area", "Logout", data.html);
			$(".logout-link").click(function () {
				socket.emit('logout');
				return false;
			});
		} else {
			$(".logout-area").remove();
			tabContent("login-form-area", "Login", data.html);
			connectLoginForm();
		}
	});

	socket.on('users', function (data) {
		tabContent("users-area", "Users", data.html);
	});

	socket.on('newchat', function (data) {
		console.log("new chat !");
		tabContent("chatbox-"+data.room+"-area", "Chat", data.html);

		$(".chatbox-"+data.room+"-area .chat-input-message").keypress(function (event) {
			if (event.which != 13 || $(this).val() == "") return;
			socket.emit("chatmsg", {message:$(this).val(), room:$(this).attr("room")});
			$(this).val("");
		}).attr("room", data.room);
	});

	socket.on('chatmsg', function (data) {
		var li = $("<li />");
		li.append($("<b />").text(data.author + " :"));
		li.append(" " + data.text);
		$(".chatbox-"+data.room+"-area .chat-box").append(li);
	});

	socket.on('groupform', function (data) {
		tabContent("group-form-area", "New Group", data.html);
		connectGroupForm();
	});

	socket.on('group', function (data) {
		tabContent("group-area", data.group.name, data.html);
		connectGroupForm();
	});

	function connectLoginForm () {
		$(".login-form").each(function () {
			var form = $(this);
			form.find("button").click(function () {
				var command = $(this).hasClass("btn-login") ? "login" : "signup";
				form.attr("command", command);
			});
			form.submit(function () {
				var username = form.find(".login-username").val();
				var password = form.find(".login-password").val();
				var command = $(this).attr("command");
				socket.emit(command, username, password);
				return false;
			});
		});
	};

	function connectGroupForm () {
		$(".group-form").submit(function () {
			var data = {
				name : $(this).find(".group-name").val(),
				key : $(this).find(".group-key").val()
			};
			socket.emit("addgroup", data);
			return false;
		});
	};

	function switchTab (key) {
		$(".tabs li.active").removeClass("active");
		$(".tabs li."+key).addClass("active");
		$(".main-content section.active").removeClass("active");
		$(".main-content section."+key).addClass("active");
	}
	
	function tabContent(key, label, html) {
		var tabs = $(".tabs");
		var tab = tabs.find("li."+key);
		if (tab.size() == 0) {
			tabs.find(".active").removeClass("active");
			var title = $("<span />").addClass("tab-name").text(label);
			var close = $("<a />").addClass("tab-close").text("x");
			close.click(function () {
				var li = $(this).parent();
				li.removeClass("active");
				var key = li.attr('class');
				li.remove();
				$(".main-content section."+key).remove();
				return false;
			});
			tab = $("<li />")
				.addClass(key)
				.addClass("active")
				.append(title)
				.append(close);
			tab.click(function () {
				if ($(this).hasClass("active")) return false;
				var key = $(this).attr('class');
				switchTab(key);
				return false;
			});
			tabs.append(tab);
		} else {
			tab.text(label);
		}
		var mainsection = $(".main-content");
		var section = mainsection.find("section."+key);
		if (section.size() == 0) {
			mainsection.find("section.active").removeClass("active");
			section = $("<section />").addClass("content-area").addClass(key).addClass("active").html(html);
			mainsection.append(section);
		} else {
			section.html(html);
		}
	}

	$(".nav-users").click(function () {
		socket.emit('users');
		return false;
	});

	$(".nav-chat").click(function () {
		var room = "default";
		if ($("chatbox-"+room+"-area").size() != 0) return false;
		socket.emit('newchat', {room:room});
		return false;
	});

	$(".nav-topics").click(function () {
		socket.emit('topichome');
		return false;
	});

	$(".nav-groups").click(function () {
		socket.emit('grouphome');
		return false;
	});

	function notify (message) {
		notifyList.push(message);
		if (!notifyTimer) {
			displayNotification();
		}
	}

	function displayNotification () {
		if (notifyList.length == 0) {
			return;
		}
		$(".notification-box").text(notifyList[0])
			.fadeIn(500, function () {
				notifyTimer = setTimeout(function () {
					$(".notification-box").fadeOut(500, function () {
						notifyTimer = null;
						notifyList.shift();
						displayNotification();
					});
				}, 2000);
			});
	}

	$(".error-box button").click(function () {
		$(".error-box").hide();
	});

	function error (message) {
		errorsList.push(message);
		$(".error-box-message").text(message);
		$(".error-box").fadeIn(500);
	}
});