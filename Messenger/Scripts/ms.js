var ApiRequest = function (apiKey) {
	var key = apiKey;
	return {
		Key: key,
		ShowFriends: function (callback) {
			if (typeof (callback) != "function")
				throw new SyntaxError("Parameter callback must be function");
			$.ajax({
				url: "/Api/Friends",
				type: "POST",
				data: JSON.stringify({ "key": key }),
				success: function (friends) {
					if (friends != null) {
						callback(friends);
					}
				},
				error: function (error) {
					document.write(error.responseText);
				}
			});
		},
		SearchFriends: function (callback, str) {
			if (typeof (callback) != "function")
				throw new SyntaxError("Parameter callback must be function");
			$.ajax({
				url: "/Api/Search",
				type: "POST",
				data: JSON.stringify({ "key": key, "search": str }),
				success: function (users) {
					callback(users);
				},
				error: function (error) {
					document.write(error.responseText);
				}
			});
		},
		GetInfo: function (callback) {
			if (typeof (callback) != "function")
				throw new SyntaxError("Parameter callback must be function");
			$.ajax({
				url: "/Api/Info",
				type: "POST",
				data: JSON.stringify({ "key": key }),
				success: function (info) {
					callback(info);
				},
				error: function (error) {
					document.write(error.responseText);
				}
			});
		}
	}
};

var DynamicPage = function () {
	return {
		AddFriends: function (friends) {
			var makeInfoFriend = "";
			$.each(friends, function (index, friend) {
				makeInfoFriend += "<li class='Friend' data-login='" + friend.Login + "'>";
				makeInfoFriend += "<img class='FriendAvatar' src='' />";
				makeInfoFriend += "<div class='FriendInfo'>";
				makeInfoFriend += "<span class='Name'>" + friend.FirstName + " " + (friend.LastName != undefined ? friend.LastName : "") + "</span><br>";
				makeInfoFriend += "<span class='LastMessage'>" + (friend.LastMessage != undefined ? friend.LastMessage : "") + "</span>";
				makeInfoFriend += "</div>";
				makeInfoFriend += "</li>";
			});
			$("#Friends").html("");
			$("#Friends").append(makeInfoFriend);
		},
		SelectFriend: function () {
			$("#NotSelectedFriend").css("display", "none");
			$("#InputMessage").css("display", "block");
			/*function ShowChat() {

			}*/
		},
		AppendMessage: function (name, message) {
			var makeMessage = "<li class='Message'>";
			makeMessage += "<img class='FriendAvatarMessage' src='' />";
			makeMessage += "<div class='MessageInfo'>";
			makeMessage += "<div class='NameUserMessage'>" + name + "</div>";
			makeMessage += "<div class='AnyMessage'>" + message + "</div>";
			makeMessage += "</div>";
			makeMessage += "</li>";
			$("#Messages").append(makeMessage);
		},
		UpdateMessage: function (login, message) {
			$("li[data-login='" + login + "']").find(".LastMessage").text(message.length <= 40 ? message : message.substring(0, 39));
			var friend = "<li class='Friend' data-login='" + login + "'>" + $("li[data-login='" + login + "']").html() + "</li>";
			$("li[data-login='" + login + "']").remove();
			$("#Friends").prepend(friend);
		}
	}
};