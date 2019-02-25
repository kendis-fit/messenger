using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using Messenger.Models;

namespace Messenger.Contexts
{
	public class UserContext : DbContext
	{
		public DbSet<RegistrationUser> Users { get; set; }
		public DbSet<Friend> Friends { get; set; }
	}
}