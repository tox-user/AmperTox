module.exports =
class Contact
{
	/**
	 * @param {number} id contact's id
	 * @param {string} name contact's username
	 * @param {number} status
	 * @param {string} statusMessage
	 * @param {number} connectionStatus
	 * @param {string} publicKey contact's public key
	 */
	constructor (id, name, status, statusMessage, connectionStatus, publicKey)
	{
		this.id = id;
		this.name = name;
		this.status = status;
		this.statusMessage = statusMessage;
		this.connectionStatus = connectionStatus;
		this.publicKey = publicKey;
	}
};