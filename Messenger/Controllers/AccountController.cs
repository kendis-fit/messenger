using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Messenger.Controllers
{
    public class AccountController : Controller
    {
        [HttpGet]
		public ActionResult Ms()
		{
			return View();
		}
    }
}