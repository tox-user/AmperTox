class Friend
{
	id: number;
	name: string;
	status: number;
	statusMessage: string;
	connectionStatus: number;
	publicKey: string;
	numUnreadMessages: number;

	/**
	 * Friend
	 * @param {number} id friend id
	 * @param {string} name username
	 * @param {number} numUnreadMessages amount of unread messages from this friend
	 */
	constructor (id: number, name: string, status: number, statusMessage: string, connectionStatus: number, publicKey: string, numUnreadMessages: number = 0)
	{
		this.id = id;
		this.name = name;
		this.status = status;
		this.statusMessage = statusMessage;
		this.connectionStatus = connectionStatus;
		this.publicKey = publicKey;
		this.numUnreadMessages = numUnreadMessages;
	}
}

export default Friend;