using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Messenger.Models;
using Messenger.Contexts;
using Newtonsoft.Json;

namespace Messenger.Controllers
{
    public class ApiController : Controller
    {
		private UserContext db = new UserContext();

		[HttpPost]
		public JsonResult Key()
		{
			var User = JsonConvert.DeserializeObject<LoginUser>(Request.Params[0]);
			if (ModelState.IsValid)
			{
				var user = db.Users.Where(usr => string.Compare(usr.Login, User.Login) == 0 &&
						string.Compare(usr.Password, User.Password) == 0).FirstOrDefault();
				if (user != null)
					return Json(new { key = user.Authorization });
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
					.Where(result => idFriends.Contains(result.user.Id))
					.Select(result => new
					{
						result.user.Login,
						result.user.FirstName,
						result.user.LastName,
						result.friend.LastMessage
					});

				return Json(friends);
			}
			return null;
		}

		[HttpPost]
		public JsonResult Search()
		{
			var data = JsonConvert.DeserializeObject<dynamic>(Request.Params[0]);
			string key = (string)data.key;
			string search = (string)data.search;
			var user = db.Users.Where(usr => string.Compare(usr.Authorization, key) == 0).FirstOrDefault();
			if (user != null)
			{
				var users = db.Users.Where(usr => usr.Login.Contains(search))
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

		protected override void Dispose(bool disposing)
		{
			if (disposing) db.Dispose();
			base.Dispose(disposing);
		}
	}
}