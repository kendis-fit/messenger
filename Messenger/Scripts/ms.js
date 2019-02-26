﻿
function User(login, firstName, lastName) {
	var Login = login;
	var FirstName = firstName;
	var LastName = lastName;
	this.Get = function () {
		return {
			Login, FirstName, LastName
		}
	}
}

function Friend(login, firstName, lastName, lastSeen, online) {
	var Login = login;
	var FirstName = firstName;
	var LastName = lastName;
	var LastSeen = lastSeen;
	var Online = online;
	this.Get = function () {
		return {
			Login, FirstName, LastName, LastSeen, Online
		}
	}
}


var ApiRequest = function (apiKey) {

	var Key = apiKey;
	var AjaxPostRequest = function (url, data, callback) {

		if (typeof (callback) != "function")
			throw new SyntaxError("Parameter callback must be function");

		$.ajax({
			url: url,
			type: "POST",
			data: data,
			success: function (data) {
				if (data != null) {
					callback(data);
				}
			},
			error: function (error) {
				document.write(error.responseText);
			}
		});
	}

	return {
		Key,
		ShowFriends: function (callback) {
			var url = "/Api/Friends";
			var data = JSON.stringify({ "key": Key });
			AjaxPostRequest(url, data, callback);
		},
		SearchFriends: function (str, callback) {
			var url = "/Api/Search";
			var data = JSON.stringify({ "key": Key, "search": str });
			AjaxPostRequest(url, data, callback);
		},
		GetInfo: function (callback) {
			var url = "/Api/Info";
			var data = JSON.stringify({ "key": Key });
			AjaxPostRequest(url, data, callback);
		},
		ShowInfoFriend: function (login, callback) {
			var url = "/Api/InfoFriend";
			var data = JSON.stringify({ "key": Key, "login": login });
			AjaxPostRequest(url, data, callback);
		},
		ShowMessages: function (login, callback) {
			var url = "/Api/Messages";
			var data = JSON.stringify({ "key": Key, "login": login });
			AjaxPostRequest(url, data, callback);
		}
	}
};

var DynamicFriend = function () {

	return {
		Select: function () {
			$("#NotSelectedFriend").css("display", "none");
			$("#InputMessage").css("display", "block");
			function ShowChat(login) {
				alert("Ajax request to show a chat " + login);
			}
			return ShowChat;
		},
		Show: function (friends) {
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
		Add: function (friend) {

		}
	}
}

var DynamicMessage = function () {

	return {
		Append: function (name, message) {
			var makeMessage = "<li class='Message'>";
			makeMessage += "<img class='FriendAvatarMessage' src='' />";
			makeMessage += "<div class='MessageInfo'>";
			makeMessage += "<div class='NameUserMessage'>" + name + "</div>";
			makeMessage += "<div class='AnyMessage'>" + message + "</div>";
			makeMessage += "</div>";
			makeMessage += "</li>";
			$("#Messages").append(makeMessage);
		},
		Update: function (login, message) {
			$("li[data-login='" + login + "']").find(".LastMessage").text(message.length <= 40 ? message : message.substring(0, 39));
			var friend = "<li class='Friend' data-login='" + login + "'>" + $("li[data-login='" + login + "']").html() + "</li>";
			$("li[data-login='" + login + "']").remove();
			$("#Friends").prepend(friend);
		}
	}
}