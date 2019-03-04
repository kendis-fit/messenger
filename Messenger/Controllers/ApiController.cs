using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Messenger.Models;
using Messenger.Contexts;
using Messenger.Code;
using Newtonsoft.Json;

namespace Messenger.Controllers
{
    public class ApiController : Controller
    {
		private UserContext db = new UserContext();
		private MongoMessageRepository dbMessages = new MongoMessageRepository();

		[HttpPost]
		public JsonResult Key()
		{
			var User = JsonConvert.DeserializeObject<LoginUser>(Request.Params[0]);
			if (ModelState.IsValid)
			{
				var authorization = db.Users.Where(usr => string.Compare(usr.Login, User.Login) == 0 &&
						string.Compare(usr.Password, User.Password) == 0)
						.Select(usr => usr.Authorization).FirstOrDefault();
				if (authorization != null)
					return Json(new { key = authorization });
			}
			return null;
		}

		[HttpPost]
		public JsonResult Info()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			var user = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => new
				{
					usr.Login,
					usr.FirstName,
					usr.LastName,
					usr.Email
				}).FirstOrDefault();
			if (user != null)
				return Json(user);
			return null;
		}

		[HttpPost]
		public JsonResult InfoFriend()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			var login = (string)data.login;
			int? userExist = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => usr.Id).FirstOrDefault();
			if (userExist != null)
			{
				var friend = db.Users.Where(usr => string.Compare(usr.Login, login) == 0)
					.Select(usr => new
					{
						usr.Login,
						usr.FirstName,
						usr.LastName,
						usr.LastSeen,
						usr.Online
					}).FirstOrDefault();
				if (friend != null)
					return Json(friend);
			}
			return null;
		}

		[HttpPost]
		public JsonResult CheckKey()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			int userExists = db.Users.Where(user => string.Compare(user.Authorization, key) == 0)
				.Select(user => user.Id).Count();
			if (userExists == 1)
				return Json(new { check = true });
			return Json(new { check = false });
		}

		[HttpPost]
		public JsonResult Friends()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			int? idUser = db.Users.Where(user => string.Compare(user.Authorization, key) == 0)
								.Select(user => user.Id).FirstOrDefault();
			if (idUser != null)
			{
				var idFriends = db.Friends.Where(friend => friend.UserId == idUser)
					.Select(friend => friend.FriendId);
				var friends = db.Users.Join(db.Friends,
					user => user.Id,
					friend => friend.UserId,
					(user, friend) => new { user, friend })
					.Where(result => idFriends.Contains(result.user.Id) &&
					result.friend.FriendId == idUser.Value)
					.OrderByDescending(result => result.friend.TimeMessage)
					.Select(result => new
					{
						result.user.Login,
						result.user.FirstName,
						result.user.LastName,
						result.friend.LastMessage,
						result.friend.TimeMessage
					});

				return Json(friends);
			}
			return null;
		}

		[HttpPost]
		public JsonResult Messages()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			var login = (string)data.login;

			string loginUser = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => usr.Login).FirstOrDefault();
			if (loginUser != null)
			{
				var messages = dbMessages.GetItemList(loginUser, login);
				return Json(messages);
			}
			return null;
		}

		[HttpPost]
		public void Friendship()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			var login = (string)data.login;
			var message = (string)data.message;
			DateTime dateTime = DateTime.Parse((string)data.dateTime);
			var user = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => new
				{
					usr.Id,
					usr.Login,
					usr.FirstName,
					usr.LastName
				}).FirstOrDefault();
			if (user != null)
			{
				int? idFriend = db.Users.Where(usr => string.Compare(login, usr.Login) == 0)
					.Select(usr => usr.Id).FirstOrDefault();
				if (idFriend != null)
				{
					Friend newFriend = new Friend()
					{
						UserId = user.Id,
						FriendId = idFriend.Value,
						LastMessage = message,
						TimeMessage = dateTime
					};
					Friend reverseNewFriend = new Friend()
					{
						UserId = idFriend.Value,
						FriendId = user.Id,
						LastMessage = message,
						TimeMessage = dateTime
					};
					db.Friends.Add(newFriend);
					db.Friends.Add(reverseNewFriend);
					db.SaveChanges();
					var Message = new Message
					{
						Name = user.FirstName + (user.LastName != null ? " " + user.LastName : ""),
						Text = message,
						DateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
					};
					dbMessages.Create(Message, user.Login, login);
				}
			}
		}

		[HttpPost]
		public void SendingMessage()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			var login = (string)data.login;
			var message = (string)data.message;
			var dateTime = DateTime.Parse((string)data.dateTime);
			var user = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => new
				{
					usr.Id,
					usr.Login,
					usr.FirstName,
					usr.LastName
				}).FirstOrDefault();
			if (user != null)
			{
				int? idFriend = db.Users.Where(usr => string.Compare(usr.Login, login) == 0)
					.Select(usr => usr.Id).FirstOrDefault();
				if (idFriend != null)
				{
					var Message = new Message
					{
						Name = user.FirstName + (user.LastName != null ? " " + user.LastName : ""),
						Text = message,
						DateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
					};
					var friendField1 = db.Friends.Where(usr => usr.UserId == user.Id &&
					usr.FriendId == idFriend.Value).FirstOrDefault();
					friendField1.LastMessage = message;
					friendField1.TimeMessage = dateTime;
					var friendField2 = db.Friends.Where(usr => usr.UserId == idFriend.Value &&
					usr.FriendId == user.Id).FirstOrDefault();
					friendField2.LastMessage = message;
					friendField2.TimeMessage = dateTime;
					db.Entry(friendField1).State = System.Data.Entity.EntityState.Modified;
					db.Entry(friendField2).State = System.Data.Entity.EntityState.Modified;
					db.SaveChanges();
					dbMessages.Update(Message, user.Login, login);
				}
			}
		}

		[HttpPost]
		public JsonResult Search()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			string key = (string)data.key;
			string search = (string)data.search;
			var login = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => usr.Login)
				.FirstOrDefault();
			if (login != null)
			{
				var users = db.Users.Where(usr => usr.Login.Contains(search) &&
					string.Compare(login, usr.Login) != 0) 
					.Select(usr => new
					{
						usr.Login,
						usr.FirstName,
						usr.LastName
					});
				return Json(users);
			}
			return null;
		}

		//[HttpPost]
		//public void Exit()
		//{
		//	var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
		//	string key = (string)data.key;
		//	var dateTime = DateTime.Parse((string)data.dateTime);
		//	var user = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0).FirstOrDefault();
		//	if (user != null)
		//	{
		//		user.Online = false;
		//		user.ConnectionId = null;
		//		user.LastSeen = dateTime;
		//		db.Entry(user).State = System.Data.Entity.EntityState.Modified;
		//		db.SaveChanges();
		//	}
		//}

		protected override void Dispose(bool disposing)
		{
			if (disposing) db.Dispose();
			base.Dispose(disposing);
		}
	}
}