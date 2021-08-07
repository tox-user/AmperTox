class Message
{
	/**
	 * Chat message
	 * @param {number} contactId
	 * @param {string} message
	 * @param {Date} date
	 */
	constructor(contactId, message, date)
	{
		this.contactId = contactId;
		this.message = message;
		this.date = date;
	}
}

module.exports = Message;