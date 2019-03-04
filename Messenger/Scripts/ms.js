﻿
Date.prototype.VisualTime = function () {
	var seconds = this.getSeconds();
	var minutes = this.getMinutes();
	var hours = this.getHours();
	if (hours < 10)
		hours = "0" + hours;
	if (minutes < 10)
		minutes = "0" + minutes;
	if (seconds < 10)
		seconds = "0" + seconds;
	return hours + ":" + minutes + ":" + seconds;
};

Date.prototype.VisualDate = function () {
	var month = this.getMonth() + 1;
	var day = this.getDate();
	var year = this.getFullYear();
	if (month < 10)
		month = "0" + month;
	if (day < 10)
		day = "0" + day;
	return month + "/" + day + "/" + year;
};

Date.ParseServerDate = function (str) {
	// example date from server: /Date(1551474527000)/
	if (typeof str != "string")
		throw new SyntaxError("Parameter str must be string");
	var dateTime = new Date(Number.parseInt(str.substr(6, 13)));
	return dateTime;
};

var ApiRequest = function (apiKey) {

	var Key = apiKey;
	var AjaxPostRequest = function (url, data, callback) {

		if (typeof (callback) != "function" && typeof (callback) != "undefined")
			throw new SyntaxError("Parameter callback must be function");

		$.ajax({
			url: url,
			type: "POST",
			data: data,
			success: function (data) {
				if (data != null && callback != undefined) {
					callback(data);
				}
				else if (callback != undefined)
					callback();
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
		GetInfoFriend: function (login, callback) {
			var url = "/Api/InfoFriend";
			var data = JSON.stringify({ "key": Key, "login": login });
			AjaxPostRequest(url, data, callback);
		},
		ShowMessages: function (login, callback) {
			var url = "/Api/Messages";
			var data = JSON.stringify({ "key": Key, "login": login });
			AjaxPostRequest(url, data, callback);
		},
		SendMessage: function (login, message, dateTime, callback) {
			var url = "/Api/SendingMessage";
			var data = JSON.stringify({ "key": Key, "login": login, "message": message, "dateTime": dateTime });
			AjaxPostRequest(url, data, callback);
		},
		CreateFriendship: function (login, message, dateTime, callback) {
			var url = "/Api/Friendship";
			var data = JSON.stringify({ "key": Key, "login": login, "message": message, "dateTime": dateTime });
			AjaxPostRequest(url, data, callback);
		},
		RemoveCountNotReadMessages: function (login) {
			var url = "/Api/CountNotReadMessages";
			var data = JSON.stringify({ "key": Key, "login": login });
			AjaxPostRequest(url, data);
		},
		Exit: function (dateTime, callback) {
			var url = "/Api/Exit";
			var data = JSON.stringify({ "key": Key, "dateTime": dateTime });
			AjaxPostRequest(url, data, callback);
		}
	}
};

var DynamicFriend = function () {

	return {
		Select: function (user) {
			var dateTimeOrTime = user.LastSeen.toDateString() == new Date().toDateString() ?
				user.LastSeen.VisualTime() : user.LastSeen.VisualDate() + " " + user.LastSeen.VisualTime();
			$("#NotSelectedFriend").css("display", "none");
			$("#InputMessage").css("display", "block");
			$("#ScrollMessages").css("display", "block");
			$("#UserInfo").css("display", "block");
			$("#UserInfo").find(".Name").text(user.FirstName + (user.LastName == null ? "" : " " + user.LastName));
			$("#UserInfo").find(".LastSeen").text(!user.Online ? "Last seen at " + dateTimeOrTime : "Online");
		},
		Search: function (pattern) {
			var tags = [];
			$.each($("tr.Friend"), function (index, friend) {
				if ($(friend).data("login").indexOf(pattern) < 0 &&
					$(friend).find(".Name").text().indexOf(pattern) < 0)
					tags.push($(friend));
			});
			$.each(tags, function (index, tag) {
				$(tag).remove();
			});
		},
		Show: function (friends) {
			var makeInfoFriend = "";
			$.each(friends, function (index, friend) {
				var dateTime = Date.ParseServerDate(friend.TimeMessage);
				var dateOrTime = dateTime.toDateString() == new Date().toDateString() ?
					dateTime.VisualTime() : dateTime.VisualDate();
				makeInfoFriend += "<tr class='Friend' data-login='" + friend.Login + "'>";
				makeInfoFriend += "<td class='FriendAvatar'><img src='' /></td>";
				makeInfoFriend += "<td class='FriendInfo'>";
				makeInfoFriend += "<span class='Name'>" + friend.FirstName + " " + (friend.LastName != undefined ? friend.LastName : "") + "</span><br>";
				makeInfoFriend += "<span class='LastMessage'>" + (friend.LastMessage != undefined ? friend.LastMessage : "") + "</span>";
				makeInfoFriend += "</td>";
				makeInfoFriend += "<td class='TimeAndCountNotReadMessages'>";
				makeInfoFriend += "<time>" + dateOrTime + "</time>";
				console.log(friend.CountNotReadMessages);
				if (friend.CountNotReadMessages != null) {
					makeInfoFriend += "<div class='CountNotReadMessages'>";
					makeInfoFriend += "<span>" + friend.CountNotReadMessages + "</span>";
					makeInfoFriend += "</div>";
				}
				makeInfoFriend += "</td>";
				makeInfoFriend += "</tr>";
			});
			$("#Friends").html("");
			$("#Friends").append(makeInfoFriend);
		},
		Append: function (friend) {
			var makeInfoFriend = "";
			makeInfoFriend += "<tr class='Friend' data-login='" + friend.Login + "'>";
			makeInfoFriend += "<td class='FriendAvatar'><img src='' /></td>";
			makeInfoFriend += "<td class='FriendInfo'>";
			makeInfoFriend += "<span class='Name'>" + friend.FirstName + " " + (friend.LastName != undefined ? friend.LastName : "") + "</span><br>";
			makeInfoFriend += "<span class='LastMessage'>" + (friend.LastMessage != undefined ? friend.LastMessage : "") + "</span>";
			makeInfoFriend += "</td>";
			makeInfoFriend += "<td class='TimeAndCountNotReadMessages'><time>" + friend.TimeMessage + "</time></td>";
			makeInfoFriend += "</tr>";
			$("#Friends").prepend(makeInfoFriend);
		}
	}
}

var DynamicMessage = function () {

	return {
		Append: function (message) {
			var makeMessage = "<tr class='Message'>";
			makeMessage += "<td class='FriendAvatarMessage'><img src='' /></td>";
			makeMessage += "<td class='MessageInfo'>";
			makeMessage += "<span class='NameSender'>" + message.Name + "</span><br>";
			makeMessage += "<span class='TextMessage'>" + message.Text + "</span>";
			makeMessage += "</td>";
			makeMessage += "<td class='TimeMessage'><time>" + message.DateTime.VisualDate() + " " + message.DateTime.VisualTime() + "</time></td>";
			makeMessage += "</tr>";
			$("#Messages").append(makeMessage);
			$("#ScrollMessages").animate({ scrollTop: 1000000 }, 500);
		},
		ExistsCountNotRead: function (login) {
			return ($("tr[data-login='" + login + "']").find(".CountNotReadMessages").length);
		},
		CreateCountNotRead: function (login) {
			var makeCountNotRead = "<div class='CountNotReadMessages'>";
			makeCountNotRead += "<span>1</span>";
			makeCountNotRead += "</div>";
			$("tr[data-login='" + login + "']").find(".TimeAndCountNotReadMessages").append(makeCountNotRead);
		},
		UpdateCountNotRead: function (login) {
			var count = $("tr[data-login='" + login + "']").find(".TimeAndCountNotReadMessages").find("span").text();
			$("tr[data-login='" + login + "']").find(".TimeAndCountNotReadMessages").find("span").text(Number.parseInt(count) + 1);
		},
		RemoveCountNotRead: function (login) {
			$("tr[data-login='" + login + "']").find(".CountNotReadMessages").remove();
		},
		Update: function (login, message) {
			if ($("tr[data-login='" + login + "']").length) {
				$("tr[data-login='" + login + "']").find(".LastMessage")
					.text(message.Text.length <= 40 ? message.Text : message.Text.substring(0, 39));
				$("tr[data-login='" + login + "']").find(".Time").html("<time>" + message.DateTime.VisualTime() + "</time");
				var friend = "<tr class='Friend' data-login='" + login + "'>" + $("tr[data-login='" + login + "']").html() + "</tr>";
				$("tr[data-login='" + login + "']").remove();
				$("#Friends").prepend(friend);
			}
			else {
				var friend = {
					"Login": login,
					"FirstName": message.Name,
					"LastMessage": message.Text,
					"TimeMessage": message.DateTime.VisualTime()
				};
				Append(message);
				DynamicFriend().Append(friend);
			}
		},
		Show: function (messages) {
			var makeMessages = "";
			$.each(messages, function (index, message) {
				var dateTime = Date.ParseServerDate(message.DateTime);
				makeMessages += "<tr class='Message'>";
				makeMessages += "<td class='FriendAvatarMessage'><img src='' /></td>";
				makeMessages += "<td class='MessageInfo'>";
				makeMessages += "<span class='NameSender'>" + message.Name + "</span><br>";
				makeMessages += "<span class='TextMessage'>" + message.Text + "</span>";
				makeMessages += "</td>";
				makeMessages += "<td class='TimeMessage'><time>" + dateTime.VisualDate() + " " + dateTime.VisualTime() + "</time></td>";
				makeMessages += "</tr>";
			});
			$("#Messages").html("");
			$("#Messages").append(makeMessages);
			$("#ScrollMessages").animate({ scrollTop: 1000000 }, 500);
		}
	}
}