module.exports =
class Contact
{
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