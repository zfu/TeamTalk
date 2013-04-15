var socket = null;

$(function () {
	socket = io.connect('http://'+window.location.host);

	socket.on('error', function (message) {
		console.log("Error : " + message);
	});

	socket.on('notify', function (message) {
		console.log("Notify : " + message);
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
		li.append($("<b />").text(data.from + " :"));
		li.append(" " + data.message);
		$(".chatbox-"+data.room+"-area .chat-box").append(li);
	});

	function connectLoginForm () {
		$(".login-form").each(function () {
			var form = $(this);
			form.find("button").click(function () {
				var username = form.find(".username").val();
				var password = form.find(".password").val();
				var command = $(this).hasClass("btn-login") ? "login" : "signup";
				socket.emit(command, username, password);
				return false;
			});
		});
	}

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
			tab = $("<li />").addClass(key).addClass("active").text(label);
			tab.click(function () {
				if ($(this).hasClass("active")) return;
				var key = $(this).attr('class');
				switchTab(key);
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
});