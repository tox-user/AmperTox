module.exports =
{
	/**
	 * Finds a file transfer index in file transfer array
	 * @typedef {import('../models/fileTransfer')} FileTransfer
	 * @param {FileTransfer[]} array array of file transfers
	 * @param {number} id file transfer ID
	 * @param {number} contactId
	 * @returns {number} array index or -1 if doesn't exist
	 */
	findFileTransferIndex: (array, id, contactId) =>
	{
		return array.findIndex(transfer => transfer.id == id && transfer.contactId == contactId);
	}
};