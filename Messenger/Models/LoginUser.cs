using System.ComponentModel.DataAnnotations;

namespace Messenger.Models
{
	public class LoginUser
	{
		[Required]
		public string Login { get; set; }

		[Required]
		public string Password { get; set; }
	}
}