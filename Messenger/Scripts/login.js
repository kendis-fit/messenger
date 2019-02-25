function User(login, password) {
	this.Login = login;
	this.Password = password;
	this.EncryptPassword = function (algorithm) {
		if (typeof (algorithm) != "function")
			throw new SyntaxError("Parameter algorithm must be function");
		return algorithm(this.Password, false);
	};
	this.ToJson = function () {
		return JSON.stringify(this);
	};
};

var Request = function () {
	return {
		CheckKey: function (key, callback) {
			$.ajax({
				url: "/Api/CheckKey",
				type: "POST",
				async: false,
				data: JSON.stringify({ "key": key }),
				success: function (data) {
					callback(data.check);
				}
			});
		},
		SetKey: function (user, callback) {
			if (typeof (user) != "object")
				throw new SyntaxError("Parameter user must be object");
			$.ajax({
				url: "/Api/Key",
				type: "POST",
				data: user.ToJson(),
				async: false,
				success: function (data) {
					callback(data.key);
				},
				error: function (x) {
					document.write(x.responseText);
				}
			});
		}
	}
};	