const ref = require("ref-napi");
const ffi = require("ffi-napi");
const types = require("./types");
const libtoxcore = require("./libtoxcore");
const fs = require("fs");
const FileControl = require("../models/file-control");
const FileKind = require("../models/file-kind");

class Tox
{
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

	iterate()
	{
		libtoxcore.tox_iterate(this.tox, null);
	}

	getIterationInterval()
	{
		return libtoxcore.tox_iteration_interval(this.tox);
	}

	connect(ipAddress, port, publicKey)
	{
		const buffer = Buffer.from(publicKey, "hex");
		const view = new Uint8Array(buffer);
		return libtoxcore.tox_bootstrap(this.tox, ipAddress, port, view, this.bootstrapError);
	}

	getAddress()
	{
		const size = libtoxcore.tox_address_size();
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_address(this.tox, view);
		return Buffer.from(view).toString("hex");
	}

	getPublicKey()
	{
		const size = libtoxcore.tox_public_key_size();
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_public_key(this.tox, view);
		return Buffer.from(view).toString("hex");
	}

	getUsername()
	{
		const size = libtoxcore.tox_self_get_name_size(this.tox);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_name(this.tox, view);
		return Buffer.from(view).toString("utf8");
	}

	setUsername(name)
	{
		const errorPtr = ref.alloc("int");
		let buffer = Buffer.from(name, "utf8");
		libtoxcore.tox_self_set_name(this.tox, name, buffer.length, errorPtr);
		this.username = this.getUsername();
	}

	setStatusMessage(statusMessage)
	{
		const errorPtr = ref.alloc("int");
		let buffer = Buffer.from(statusMessage, "utf8");
		libtoxcore.tox_self_set_status_message(this.tox, statusMessage, buffer.length, errorPtr);
		this.username = this.getUsername();
	}

	getStatusMessage()
	{
		const size = libtoxcore.tox_self_get_status_message_size(this.tox);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_status_message(this.tox, view);
		return Buffer.from(view).toString("utf8");
	}

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

	onConnectionStatusChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', types.userDataPtr], callback);
		libtoxcore.tox_callback_self_connection_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

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

	onFriendStatusChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	onFriendStatusMessageChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_status_message(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	onFriendNameChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_name(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	onFriendConnectionStatusChange(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_connection_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

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

	onFileReceiveControlMsg(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_file_recv_control(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	onFileReceiveChunkRequest(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "int", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_file_chunk_request(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	onMessageReceive(callback)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_message(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	sendFileControlMsg(contactId, fileId, type)
	{
		console.log("sending control", contactId, fileId, type);
		let error = ref.alloc("int");
		return libtoxcore.tox_file_control(this.tox, contactId, fileId, type, error);
	}

	acceptFileTransfer(contactId, fileId)
	{
		let type = FileControl.TOX_FILE_CONTROL_RESUME.value;
		this.sendFileControlMsg(contactId, fileId, type);
	}

	rejectFileTransfer(contactId, fileId)
	{
		let type = FileControl.TOX_FILE_CONTROL_CANCEL.value;
		this.sendFileControlMsg(contactId, fileId, type);
	}

	getContacts()
	{
		const size = libtoxcore.tox_self_get_friend_list_size(this.tox);
		const buffer = new ArrayBuffer(size * 4);
		const view = new Uint32Array(buffer);
		libtoxcore.tox_self_get_friend_list(this.tox, view);
		return view;
	}

	acceptFriendRequest(publicKey)
	{
		const buffer = Buffer.from(publicKey, "hex");
		const view = new Uint8Array(buffer);
		let err = ref.alloc("int");
		return libtoxcore.tox_friend_add_norequest(this.tox, view, err);
	}

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

	getContactPublicKey(id)
	{
		let err = ref.alloc("int");
		const buffer = new ArrayBuffer(32);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_friend_get_public_key(this.tox, id, view, err);
		return Buffer.from(view).toString("hex");
	}

	sendMessage(contactId, message)
	{
		const messageType = 0; // normal message
		const errorPtr = ref.alloc("int");
		let buffer = Buffer.from(message, "utf8");
		libtoxcore.tox_friend_send_message(this.tox, contactId, messageType, buffer, buffer.length, errorPtr);
	}
}

module.exports = Tox;