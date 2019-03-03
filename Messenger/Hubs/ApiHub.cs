using System;
using System.Linq;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using Messenger.Contexts;

namespace Messenger.Hubs
{
	public class ApiHub : Hub
	{
		private UserContext db = new UserContext(); 

		public void Connect(string key)
		{
			var user = db.Users.FirstOrDefault(usr => string.Compare(key, usr.Authorization) == 0);
			if (user != null)
			{
				user.Online = true;
				user.ConnectionId = Context.ConnectionId;
				db.Entry(user).State = System.Data.Entity.EntityState.Modified;
				db.SaveChanges();
				// Send Online
				var idFriends = db.Friends.Where(usr => usr.UserId == user.Id)
					.Select(usr => usr.FriendId);
				var connectionIdFriends = db.Users.Where(usr => idFriends.Contains(usr.Id) 
					&& !string.IsNullOrEmpty(usr.ConnectionId))
					.Select(usr => usr.ConnectionId);
				foreach (var connectionId in connectionIdFriends)
					Clients.Client(connectionId).isOnlineFriend(user);
			}
		}

		public void Send(string key, string login, string loginFriend, dynamic message)
		{
			// sender must have such a fields as login, firstName, lastName
			// message must have such a fields as lastMessage, timeMessage
			bool IsCorrectKey = db.Users.Any(user => string.Compare(key, user.Authorization) == 0);
			if (IsCorrectKey)
			{
				string friendConnectionId = db.Users.Where(user => string.Compare(loginFriend, user.Login) == 0)
					.Select(user => user.ConnectionId).FirstOrDefault();
				if (friendConnectionId != null)
					Clients.Client(friendConnectionId).getMessage(login, message);
			}
		}

		public override Task OnDisconnected(bool stopCalled)
		{
			string id = Context.ConnectionId;
			var user = db.Users.FirstOrDefault(usr => string.Compare(usr.ConnectionId, id) == 0);
			if (user != null)
			{
				user.Online = false;
				user.LastSeen = DateTime.Now;
				user.ConnectionId = null;
				db.Entry(user).State = System.Data.Entity.EntityState.Modified;
				db.SaveChanges();
				// Disconnected
				var idFriends = db.Friends.Where(usr => usr.UserId == user.Id)
					.Select(usr => usr.FriendId);
				var connectionIdFriends = db.Users.Where(usr => idFriends.Contains(usr.Id)
					&& !string.IsNullOrEmpty(usr.ConnectionId))
					.Select(usr => usr.ConnectionId);
				foreach (var connectionId in connectionIdFriends)
					Clients.Client(connectionId).isOnlineFriend(user);
			}
			return base.OnDisconnected(stopCalled);
		}

		protected override void Dispose(bool disposing)
		{
			if (disposing) db.Dispose();
			base.Dispose(disposing);
		}
	}
}