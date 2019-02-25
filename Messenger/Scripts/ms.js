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
		}
	}
};

var DynamicPage = function () {
	return {
		AddFriends: function (friends) {
			var makeInfoFriend = "";
			$.each(friends, function (index, friend) {
				makeInfoFriend += "<li class='Friend'>";
				makeInfoFriend += "<img class='FriendAvatar' src='' />";
				makeInfoFriend += "<div class='FriendInfo'>";
				makeInfoFriend += "<span class='Name'>" + friend.FirstName + " " + (friend.LastName != undefined ? friend.LastName : "") + "</span></br>";
				makeInfoFriend += "<span class='LastMessage'>" + (friend.LastMessage != undefined ? friend.LastMessage : "") + "</span>";
				makeInfoFriend += "</div>";
				makeInfoFriend += "</li>";
			});
			$("#Friends").html("");
			$("#Friends").append(makeInfoFriend);
		}
	}
};	