module.exports =
class FileTransfer
{
	/**
	 * File transfer
	 * @param {number} id file transfer ID from toxcore
	 * @param {number} fd file descriptor used by nodejs
	 * @param {string} fileName name of the file
	 * @param {number} contactId
	 * @param {boolean} isAvatar if this is an avatar file transfer
	 */
	constructor (id, fd, fileName, contactId, isAvatar)
	{
		this.id = id;
		this.fd = fd;
		this.fileName = fileName;
		this.contactId = contactId;
		this.isAvatar = isAvatar;
	}
};