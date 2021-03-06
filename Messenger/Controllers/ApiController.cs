﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
			var user = db.Users.AsEnumerable().Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => new
				{
					usr.Login,
					usr.FirstName,
					usr.LastName,
					usr.Email,
					Avatar = usr.Avatar == null ? null : Encoding.ASCII.GetString(usr.Avatar)
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
			bool isCorrectKey = db.Users.Any(usr => string.Compare(usr.Authorization, key) == 0);
			if (isCorrectKey)
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
			bool isCorrectKey = db.Users.Any(usr => string.Compare(usr.Authorization, key) == 0);
			if (isCorrectKey)
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
				var friends = db.Users.AsEnumerable().Join(db.Friends,
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
						Avatar = result.user.Avatar == null ? null : Encoding.ASCII.GetString(result.user.Avatar),
						result.friend.LastMessage,
						result.friend.TimeMessage,
						result.friend.CountNotReadMessages
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
				return Json(dbMessages.GetItemList(loginUser, login));
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
		public void CountNotReadMessages()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			var key = (string)data.key;
			var login = (string)data.login;

			int? idUser = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0)
				.Select(usr => usr.Id).FirstOrDefault();
			if (idUser != null)
			{
				int? idFriend = db.Users.Where(usr => string.Compare(usr.Login, login) == 0)
				.Select(usr => usr.Id).FirstOrDefault();
				if (idFriend != null)
				{
					var friendship = db.Friends.Where(user => idUser.Value == user.FriendId &&
						idFriend.Value == user.UserId).FirstOrDefault();
					if (friendship != null)
					{
						friendship.CountNotReadMessages = null;
						db.Entry(friendship).State = System.Data.Entity.EntityState.Modified;
						db.SaveChanges();
					}
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
				var users = db.Users.AsEnumerable().Where(usr => usr.Login.Contains(search) &&
					string.Compare(login, usr.Login) != 0) 
					.Select(usr => new
					{
						usr.Login,
						usr.FirstName,
						usr.LastName,
						TimeMessage = usr.LastSeen,
						Avatar = usr.Avatar == null ? null : Encoding.ASCII.GetString(usr.Avatar)
					});
				return Json(users);
			}
			return null;
		}

		protected override void Dispose(bool disposing)
		{
			if (disposing) db.Dispose();
			base.Dispose(disposing);
		}
	}
}