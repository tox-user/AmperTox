const ref = require("ref-napi");
const ffi = require("ffi-napi");
const types = require("./types");
const libtoxcore = require("./libtoxcore");
const fs = require("fs");
const FileControl = require("../models/file-control");
const FileKind = require("../models/file-kind");

class Tox
{
	/**
	 * Creates new Tox instance
	 * @typedef {import('../models/tox-options')} ToxOptions
	 * @param {ToxOptions} options
	 */
	constructor(options=null)
	{
		this.error = ref.alloc("int");
		this.bootstrapError = ref.alloc("int");
		let optionsRef = null;

		if (options != null)
		{
			optionsRef = options.ref();
			this.options = options;
		}

		this.tox = libtoxcore.tox_new(optionsRef, this.error);
		this.address = this.getAddress();
		this.username = this.getUsername();
		this.publicKey = this.getPublicKey();
		this.statusMessage = this.getStatusMessage();
		this.contacts = this.getContacts();
	}

	/**
	 * Calls Tox loop
	 */
	iterate()
	{
		libtoxcore.tox_iterate(this.tox, null);
	}

	/**
	 * Gets time until next Tox loop should be called
	 * @returns {number} miliseconds
	 */
	getIterationInterval()
	{
		return libtoxcore.tox_iteration_interval(this.tox);
	}

	/**
	 * Connects to a bootstrap node
	 * @param {string} ipAddress bootstrap node's ip address
	 * @param {number} port bootstrap node's port
	 * @param {string} publicKey bootstrap node's public key
	 * @returns {boolean}
	 */
	connect(ipAddress, port, publicKey)
	{
		const buffer = Buffer.from(publicKey, "hex");
		const view = new Uint8Array(buffer);
		return libtoxcore.tox_bootstrap(this.tox, ipAddress, port, view, this.bootstrapError);
	}

	/**
	 * Gets this Tox instance's Tox ID
	 * @returns {string} Tox ID
	 */
	getAddress()
	{
		const size = libtoxcore.tox_address_size();
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_address(this.tox, view);
		return Buffer.from(view).toString("hex");
	}

	/**
	 * Gets this Tox instance's public key
	 * @returns {string} public key
	 */
	getPublicKey()
	{
		const size = libtoxcore.tox_public_key_size();
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_public_key(this.tox, view);
		return Buffer.from(view).toString("hex");
	}

	/**
	 * Gets this Tox instance's username
	 * @returns {string} username
	 */
	getUsername()
	{
		const size = libtoxcore.tox_self_get_name_size(this.tox);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_name(this.tox, view);
		return Buffer.from(view).toString("utf8");
	}

	/**
	 * Sets new username for this Tox instance
	 * @param {string} name
	 */
	setUsername(name)
	{
		const errorPtr = ref.alloc("int");
		let buffer = Buffer.from(name, "utf8");
		libtoxcore.tox_self_set_name(this.tox, name, buffer.length, errorPtr);
		this.username = this.getUsername();
	}

	/**
	 * Sets new status message for this Tox instance
	 * @param {string} statusMessage
	 */
	setStatusMessage(statusMessage)
	{
		const errorPtr = ref.alloc("int");
		let buffer = Buffer.from(statusMessage, "utf8");
		libtoxcore.tox_self_set_status_message(this.tox, statusMessage, buffer.length, errorPtr);
		this.username = this.getUsername();
	}

	/**
	 * Gets this Tox instance's status message
	 * @returns {string} status message
	 */
	getStatusMessage()
	{
		const size = libtoxcore.tox_self_get_status_message_size(this.tox);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_status_message(this.tox, view);
		return Buffer.from(view).toString("utf8");
	}

	/**
	 * Asynchronously saves this Tox profile
	 * @param {string} profileSavePath path to save the profile in - it must contain a file name without the file extension
	 * @returns {Promise}
	 */
	save(profileSavePath)
	{
		return new Promise((resolve) =>
		{
			console.log("Saving profile...");
			const dataSize = libtoxcore.tox_get_savedata_size(this.tox);
			const buffer = new ArrayBuffer(dataSize);
			const view = new Uint8Array(buffer);
			libtoxcore.tox_get_savedata(this.tox, view);

			fs.writeFile(`${profileSavePath}.tox`, view, (err) =>
			{
				if (err)
					throw err;

				console.log("Profile saved");
				resolve();
			});
		});
	}

	/**
	 * Asynchronously loads a Tox profile
	 * @param {string} profileName path with a file name but witout the file extension
	 * @returns {Promise<Uint8Array>}
	 */
	static load(profileName)
	{
		return new Promise((resolve) =>
		{
			fs.readFile(`${profileName}.tox`, (err, data) =>
			{
				if (err)
				{
					console.log("Error opening profile");
					throw err;
				}

				const view = new Uint8Array(data);
				resolve(view);
			});
		});
	}

	/**
	 * This Tox instance has connected / disconnected
	 * @param {(tox: any, status: number, userData: any) => void} callback
	 */
	onConnectionStatusChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', types.userDataPtr], callback);
		libtoxcore.tox_callback_self_connection_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * This Tox instance has received a friend request
	 * @param {(tox: any, publicKey: string, message: string, length: number, userData: any) => void} callback
	 */
	onFriendRequest(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "pointer", "string", "size_t", types.userDataPtr],
		(tox, publicKey, message, length, userData) =>
		{
			let publicKeyString = ref.reinterpret(publicKey, 32, 0).toString("hex");
			callback(tox, publicKeyString, message, length, userData);
		});

		libtoxcore.tox_callback_friend_request(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Contact has connected / disconnected
	 * @param {(tox: any, contactId: number, status: number, userData: any) => void} callback
	 */
	onFriendStatusChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Contact has changed their status message
	 * @param {(tox: any, id: number, message: string, length: number, userData: any) => void} callback
	 */
	onFriendStatusMessageChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_status_message(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Contact has changed their username
	 * @param {(tox: any, id: number, name: string, length: number, userData: any) => void} callback
	 */
	onFriendNameChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_name(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Contact has connected / disconnected
	 * @param {(tox: any, id: number, connectionStatus: number, userData: any) => void} callback
	 */
	onFriendConnectionStatusChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_connection_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Received a file transfer request
	 * @param {(contactId: number, fileId: number, size: number, name: string, isAvatar: boolean) => void} callback
	 */
	onFileReceive(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "int", "int", "string", "size_t", types.userDataPtr],
		(tox, contactId, fileId, transferType, size, name, nameLength, userData) =>
		{
			let isAvatar = false;
			if (transferType == FileKind.TOX_FILE_KIND_AVATAR.value)
				isAvatar = true;

			callback(contactId, fileId, size, name, isAvatar);
		});

		libtoxcore.tox_callback_file_recv(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Received a file chunk from file transfer
	 * @param {(tox: any, contactId: number, fileId: number, position: number, data: Buffer, length: number, userData: any) => void} callback
	 */
	onFileReceiveChunk(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "int", "pointer", "size_t", types.userDataPtr],
		(tox, contactId, fileId, position, data, length, userData) =>
		{
			let dataPtr;

			if (length > 0) // length is 0 on final chunk and then data is null
				dataPtr = Buffer.from(ref.reinterpret(data, length));

			callback(tox, contactId, fileId, position, dataPtr, length, userData);
		});

		libtoxcore.tox_callback_file_recv_chunk(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * @param {(tox: any, contactId: number, fileId: number, messageType: number, userData: any) => void} callback
	 */
	onFileReceiveControlMsg(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_file_recv_control(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * @param {(tox: any, contactId: number, fileId: number, position: number, size: number, userData: any) => void} callback
	 */
	onFileReceiveChunkRequest(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "int", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_file_chunk_request(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Received a message from a contact
	 * @param {(tox: any, contactId: number, messageType: number, message: string, length: number, userData: any) => void} callback
	 */
	onMessageReceive(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_message(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Sends a file transfer control message to contact - used to accept / pause / reject file transfers
	 * @param {number} contactId
	 * @param {number} fileId
	 * @param {number} type
	 * @returns {boolean}
	 */
	sendFileControlMsg(contactId, fileId, type)
	{
		console.log("sending control", contactId, fileId, type);
		let error = ref.alloc("int");
		return libtoxcore.tox_file_control(this.tox, contactId, fileId, type, error);
	}

	/**
	 * Accept file transfer from contact
	 * @param {number} contactId
	 * @param {number} fileId
	 */
	acceptFileTransfer(contactId, fileId)
	{
		let type = FileControl.TOX_FILE_CONTROL_RESUME.value;
		this.sendFileControlMsg(contactId, fileId, type);
	}

	/**
	 * Reject file transfer from contact
	 * @param {number} contactId
	 * @param {number} fileId
	 */
	rejectFileTransfer(contactId, fileId)
	{
		let type = FileControl.TOX_FILE_CONTROL_CANCEL.value;
		this.sendFileControlMsg(contactId, fileId, type);
	}

	/**
	 * Gets contacts of this Tox instance
	 * @returns {Uint32Array} contacts
	 */
	getContacts()
	{
		const size = libtoxcore.tox_self_get_friend_list_size(this.tox);
		const buffer = new ArrayBuffer(size * 4);
		const view = new Uint32Array(buffer);
		libtoxcore.tox_self_get_friend_list(this.tox, view);
		return view;
	}

	/**
	 * Accept a friend request
	 * @param {string} publicKey
	 * @returns {number}
	 */
	acceptFriendRequest(publicKey)
	{
		const buffer = Buffer.from(publicKey, "hex");
		const view = new Uint8Array(buffer);
		let err = ref.alloc("int");
		return libtoxcore.tox_friend_add_norequest(this.tox, view, err);
	}

	/**
	 * Gets contact's username
	 * @param {number} id contact id
	 * @returns {string} username
	 */
	getContactName(id)
	{
		let sizeErr = ref.alloc("int");
		let nameErr = ref.alloc("int");
		const size = libtoxcore.tox_friend_get_name_size(this.tox, id, sizeErr);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_friend_get_name(this.tox, id, view, nameErr);
		return Buffer.from(view).toString("utf8");
	}

	/**
	 * Gets contact's status message
	 * @param {number} id contact id
	 * @returns {string} status message
	 */
	getContactStatusMessage(id)
	{
		let sizeErr = ref.alloc("int");
		let nameErr = ref.alloc("int");
		const size = libtoxcore.tox_friend_get_status_message_size(this.tox, id, sizeErr);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_friend_get_status_message(this.tox, id, view, nameErr);
		return Buffer.from(view).toString("utf8");
	}

	/**
	 * Gets contact's public key
	 * @param {number} id contact id
	 * @returns {string} contact's public key
	 */
	getContactPublicKey(id)
	{
		let err = ref.alloc("int");
		const buffer = new ArrayBuffer(32);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_friend_get_public_key(this.tox, id, view, err);
		return Buffer.from(view).toString("hex");
	}

	/**
	 * Send a message to contact
	 * @param {number} contactId
	 * @param {string} message
	 */
	sendMessage(contactId, message)
	{
		const messageType = 0; // normal message
		const errorPtr = ref.alloc("int");
		let buffer = Buffer.from(message, "utf8");
		libtoxcore.tox_friend_send_message(this.tox, contactId, messageType, buffer, buffer.length, errorPtr);
	}
}

module.exports = Tox;