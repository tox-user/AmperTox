class FileTransfer
{
	id: number;
	fd: number;
	fileName: string;
	contactId: number;
	isAvatar: boolean;

	/**
	 * File transfer
	 * @param {number} id file transfer ID from toxcore
	 * @param {number} fd file descriptor used by nodejs
	 * @param {string} fileName name of the file
	 * @param {number} contactId
	 * @param {boolean} isAvatar true if this is an avatar file transfer
	 */
	constructor (id: number, fd: number, fileName: string, contactId: number, isAvatar: boolean)
	{
		this.id = id;
		this.fd = fd;
		this.fileName = fileName;
		this.contactId = contactId;
		this.isAvatar = isAvatar;
	}

	/**
	 * Finds a file transfer index in file transfer array
	 * @param {FileTransfer[]} array array of file transfers
	 * @param {number} id file transfer ID
	 * @param {number} friendId
	 * @returns {number} array index or -1 if doesn't exist
	 */
	 static findFileTransferIndex (array: FileTransfer[], id: number, friendId: number)
	 {
		 return array.findIndex(transfer => transfer.id == id && transfer.contactId == friendId);
	 }
};

export default FileTransfer;