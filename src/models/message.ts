class Message
{
	contactId: number;
	message: string;
	date: Date;

	/**
	 * Chat message
	 */
	constructor(contactId: number, message: string, date: Date)
	{
		this.contactId = contactId;
		this.message = message;
		this.date = date;
	}
}

export default Message;