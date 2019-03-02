
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
		SendMessage: function (login, message, dateTime) {
			var url = "/Api/SendingMessage";
			var data = JSON.stringify({ "key": Key, "login": login, "message": message, "dateTime": dateTime });
			AjaxPostRequest(url, data);
		},
		CreateFriendship: function (login, message, dateTime) {
			var url = "/Api/Friendship";
			var data = JSON.stringify({ "key": Key, "login": login, "message": message, "dateTime": dateTime });
			AjaxPostRequest(url, data);
		},
		Exit: function (dateTime, callback) {
			var url = "/Api/Exit";
			var data = JSON.stringify({ "key": Key, "dateTime": dateTime });
			AjaxPostRequest(url, data, callback);
			//$.ajax({
			//	url: "/Api/Exit",
			//	type: "POST",
			//	data: JSON.stringify({ "key": Key, "dateTime": dateTime }),
			//	success: function () {
			//		callback();
			//	},
			//	error: function (error) {
			//		document.write(error.responseText);
			//	}
			//});
		}
	}
};

var DynamicFriend = function () {

	return {
		Select: function (user) {
			var dateTime = new Date(Number.parseInt(user.LastSeen.substr(6, 13)));
			var dateTimeOrTime = dateTime.toDateString() == new Date().toDateString() ?
				dateTime.VisualTime() : dateTime.VisualDate() + " " + dateTime.VisualTime();
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
				// example date from server: /Date(1551474527000)/
				var dateTime = new Date(Number.parseInt(friend.TimeMessage.substr(6, 13)));
				var dateOrTime = dateTime.toDateString() == new Date().toDateString() ?
					dateTime.VisualTime() : dateTime.VisualDate();
				makeInfoFriend += "<tr class='Friend' data-login='" + friend.Login + "'>";
				makeInfoFriend += "<td class='FriendAvatar'><img src='' /></td>";
				makeInfoFriend += "<td class='FriendInfo'>";
				makeInfoFriend += "<span class='Name'>" + friend.FirstName + " " + (friend.LastName != undefined ? friend.LastName : "") + "</span><br>";
				makeInfoFriend += "<span class='LastMessage'>" + (friend.LastMessage != undefined ? friend.LastMessage : "") + "</span>";
				makeInfoFriend += "</td>";
				makeInfoFriend += "<td class='Time'><time>" + dateOrTime + "</time></td>";
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
			makeInfoFriend += "<td class='Time'><time>" + friend.TimeMessage + "</time></td>";
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
		},
		Update: function (login, message, time) {
			$("tr[data-login='" + login + "']").find(".LastMessage").text(message.length <= 40 ? message : message.substring(0, 39));
			$("tr[data-login='" + login + "']").find(".Time").html("<time>" + time + "</time");
			var friend = "<tr class='Friend' data-login='" + login + "'>" + $("tr[data-login='" + login + "']").html() + "</tr>";
			$("tr[data-login='" + login + "']").remove();
			$("#Friends").prepend(friend);
		},
		Show: function (messages) {
			var makeMessages = "";
			$.each(messages, function (index, message) {
				// example date from server: /Date(1551474527000)/
				var dateTime = new Date(Number.parseInt(message.DateTime.substr(6, 13)));
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
			$("#ScrollMessages").scrollTop($(document).height());
		}
	}
}