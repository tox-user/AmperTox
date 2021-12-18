module.exports =
class Contact
{
	/**
	 * Friend
	 * @param {number} id contact's id
	 * @param {string} name contact's username
	 * @param {number} status
	 * @param {string} statusMessage
	 * @param {number} connectionStatus
	 * @param {string} publicKey contact's public key
	 * @param {number} numUnreadMessages amount of unread messages from this contact
	 */
	constructor (id, name, status, statusMessage, connectionStatus, publicKey, numUnreadMessages=0)
	{
		this.id = id;
		this.name = name;
		this.status = status;
		this.statusMessage = statusMessage;
		this.connectionStatus = connectionStatus;
		this.publicKey = publicKey;
		this.numUnreadMessages = numUnreadMessages;
	}
};