using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Bson;
using Messenger.Models;

namespace Messenger.Code
{
	public class MongoMessageRepository
	{
		MongoClient client;
		IMongoDatabase db;

		public MongoMessageRepository()
		{
			string connectionString = "mongodb://localhost:27017";
			client = new MongoClient(connectionString);
			db = client.GetDatabase("messages");
		}

		public IEnumerable<Message> GetItemList(string nameUser, string nameFriend)
		{
			List<Message> Messages = new List<Message>();
			var messages = db.GetCollection<Message>(nameUser + "_" + nameFriend);
			using (var cursor = messages.FindSync(new BsonDocument()))
			{
				while (cursor.MoveNext())
				{
					var message = cursor.Current;
					foreach (var data in message)
					{
						Message mess = new Message
						{
							Name = data.Name,
							Text = data.Text,
							DateTime = data.DateTime
						};
						Messages.Add(mess);
					}
				}
			}

			return Messages;
		}

		public void Create(Message message, string nameUser, string nameFriend)
		{
			db.CreateCollection(nameUser + "_" + nameFriend);
			db.CreateCollection(nameFriend + "_" + nameUser);

			Update(message, nameUser, nameFriend);
		}

		public void Update(Message message, string nameUser, string nameFriend)
		{
			var document = new BsonDocument
			{
				{ "Name", message.Name },
				{ "Text", message.Text },
				{ "DateTime", message.DateTime }
			};

			var correspondence1 = db.GetCollection<BsonDocument>(nameUser + "_" + nameFriend);
			var correspondence2 = db.GetCollection<BsonDocument>(nameFriend + "_" + nameUser);

			correspondence1.InsertOne(document);
			correspondence2.InsertOne(document);
		}
	}
}