namespace Messenger.Models
{
	public class Friend
	{
		public int Id { get; set; }

		public int UserId { get; set; }

		public int FriendId { get; set; }

		public string LastMessage { get; set; }

		public System.DateTime TimeMessage { get; set; }
	}
}