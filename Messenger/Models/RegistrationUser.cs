using System;
using System.ComponentModel.DataAnnotations;

namespace Messenger.Models
{
	public class RegistrationUser
	{
		public int Id { get; set; }

		[Required]
		[MinLength(6, ErrorMessage = "Field login must have min length as min 6 symbols")]
		public string Login { get; set; }
		
		[Required]
		[DataType(DataType.EmailAddress, ErrorMessage = "Field email isn't correct")]
		public string Email { get; set; }

		[Required]
		public string FirstName { get; set; }

		public string LastName { get; set; }

		public DateTime LastSeen { get; set; }

		[Required]
		[MinLength(8, ErrorMessage = "Field password must have min length as min 8 symbols")]
		public string Password { get; set; }

		[Required]
		[Compare("Password", ErrorMessage = "Fields password and try password isn't correct")]
		public string ComparePassword { get; set; }

		public bool Online { get; set; } = false;

		public string Authorization { get; set; } = Guid.NewGuid().ToString();

		public string ConnectionId { get; set; }

		public byte[] Avatar { get; set; }
	}
}