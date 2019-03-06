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

Date.prototype.VisualUTCTime = function () {
	var seconds = this.getUTCSeconds();
	var minutes = this.getUTCMinutes();
	var hours = this.getUTCHours();
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

Date.prototype.VisualUTCDate = function () {
	var month = this.getUTCMonth() + 1;
	var day = this.getUTCDate();
	var year = this.getUTCFullYear();
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

String.prototype.IsEmptyMessage = function () {
	if (this == null || this.length == 0)
		return true;
	for (var i = 0; i < this.length; ++i) {
		var symbol = this[i].charCodeAt(0);
		if (!((symbol >= 0 && symbol <= 32) || symbol == 127))
			return false;
	}
	return true;
};