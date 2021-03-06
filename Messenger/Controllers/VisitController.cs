﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Messenger.Models;
using Messenger.Contexts;

namespace Messenger.Controllers
{
    public class VisitController : Controller
    {
		private UserContext db = new UserContext();

		[HttpGet]
        public ActionResult Login()
		{
			return View();
		}

		[HttpGet]
		public ActionResult Registration()
		{
			return View();
		}

		[HttpPost]
		public ActionResult Login(LoginUser User)
		{
			if (ModelState.IsValid)
			{
				if (string.IsNullOrEmpty(User.Login) || string.IsNullOrEmpty(User.Password))
				{
					ModelState.AddModelError("", "Fields must be filled");
					return View();
				}
				var user = db.Users.Where(usr => string.Compare(User.Login, usr.Login) == 0 &&
					string.Compare(usr.Password, User.Password) == 0).FirstOrDefault();
				if (user != null)
					return RedirectToAction("Ms", "Account");
				else
					ModelState.AddModelError("", "Login or password is not correct");
			}
			return View();
		}

		[HttpPost]
		public ActionResult Registration(RegistrationUser User)
		{
			if (ModelState.IsValid)
			{ 
				int emailExist = db.Users.Where(usr => string.Compare(usr.Email, User.Email) == 0).Count();
				if (emailExist == 1)
					ModelState.AddModelError("", "Email already exists");
				int loginExist = db.Users.Where(usr => string.Compare(usr.Login, User.Login) == 0).Count();
				if (loginExist == 1)
					ModelState.AddModelError("", "Login already exists");
				if (emailExist == 0 && loginExist == 0)
				{
					User.Authorization = Guid.NewGuid().ToString();
					db.Users.Add(User);
					db.SaveChanges();
					return RedirectToAction("Login", "Visit");
				}
			}
			return View();
		}

		protected override void Dispose(bool disposing)
		{
			if (disposing) db.Dispose();
			base.Dispose(disposing);
		}
	}
}