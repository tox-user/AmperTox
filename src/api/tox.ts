const ref = require("ref-napi");
const ffi = require("ffi-napi");
const libtoxcore = require("./libtoxcore");
import types, { RefBuffer, EventListeners } from "./types";
import fs from "fs";
import path from "path";
import ToxFileControl from "../models/tox/fileControl";
import ToxFileKind from "../models/tox/fileKind";
import { eventDefinition } from "./eventDefinition";
import ToxOptions from "../models/tox/options";

class Tox
{
	error: RefBuffer;
	bootstrapError: RefBuffer;
	options: typeof ToxOptions;
	tox: Buffer;
	eventListeners: EventListeners;
	address: string;
	username: string;
	publicKey: string;
	statusMessage: string;
	contacts: Uint32Array;

	/**
	 * Creates new Tox instance
	 */
	constructor(options: typeof ToxOptions = null)
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
		libtoxcore.tox_events_init(this.tox);

		this.eventListeners = {};

		this.address = this.getAddress();
		this.username = this.getUsername();
		this.publicKey = this.getPublicKey();
		this.statusMessage = this.getStatusMessage();
		this.contacts = this.getContacts();
	}

	/**
	 * Calls Tox loop and checks for events, calls callbacks registered with addEventListener
	 */
	eventsIterate()
	{
		const eventsPtr: Buffer = libtoxcore.tox_events_iterate(this.tox, false, null);
		const subscribedEventNames = Object.keys(eventDefinition).filter((eventName) => Object.keys(this.eventListeners).includes(eventName));

		subscribedEventNames.forEach((eventName) =>
		{
			const numEvents = eventDefinition[eventName].getAmount(eventsPtr); // amount of events of this type
			for (let i = 0; i < numEvents; i++)
			{
				const dataBuffer = eventDefinition[eventName].getData(eventsPtr, i); // get event data
				this.eventListeners[eventName](dataBuffer); // call the callback
			}
		});

		libtoxcore.tox_events_free(eventsPtr);
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
	 * Adds a listener for a given Tox event
	 */
	addEventListener(eventName: string, callback: (data: Buffer) => void)
	{
		this.eventListeners[eventName] = callback;
	}

	/**
	 * Connects to a bootstrap node
	 * @param {string} ipAddress bootstrap node's ip address
	 * @param {number} port bootstrap node's port
	 * @param {string} publicKey bootstrap node's public key
	 * @returns {boolean} true on success
	 */
	connect(ipAddress: string, port: number, publicKey: string): boolean
	{
		const buffer = Buffer.from(publicKey, "hex");
		const view = new Uint8Array(buffer);
		return libtoxcore.tox_bootstrap(this.tox, ipAddress, port, view, this.bootstrapError);
	}

	/**
	 * Gets this Tox instance's Tox ID
	 * @returns {string} Tox ID
	 */
	getAddress(): string
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
	getPublicKey(): string
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
	getUsername(): string
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
	setUsername(name: string)
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
	setStatusMessage(statusMessage: string)
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
	getStatusMessage(): string
	{
		const size = libtoxcore.tox_self_get_status_message_size(this.tox);
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_self_get_status_message(this.tox, view);
		return Buffer.from(view).toString("utf8");
	}

	/**
	 * Gets this Tox instance's status
	 * @returns {number} status - one of the values defined in TOX_USER_STATUS
	 */
	getStatus(): number
	{
		return libtoxcore.tox_self_get_status(this.tox);
	}

	/**
	 * Find a profile name that isn't used yet
	 * @param {string} savePath path to the profile save directory
	 * @param {string} profileName
	 * @returns {string} unique profile name
	 */
	uniqueProfileName(savePath: string, profileName: string): string
	{
		let uniqueName = profileName;
		let i = 2;

		while (fs.existsSync(path.resolve(savePath, `${uniqueName}.tox`)))
		{
			uniqueName = `${profileName} (${i})`;
			i++;
		}

		return uniqueName;
	}

	/**
	 * Asynchronously saves this Tox profile
	 * @param {string} profileSavePath path to save the profile in - it must contain a file name without the file extension
	 * @returns {Promise}
	 */
	save(profileSavePath: string): Promise<void>
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
	static load(profileName: string): Promise<Uint8Array>
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
	 */
	onConnectionStatusChange(callback: (tox: any, status: number, userData: any) => void)
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
	 */
	onFriendRequest(callback: (tox: any, publicKey: string, message: string, length: number, userData: any) => void)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "pointer", "string", "size_t", types.userDataPtr],
		(tox: any, publicKey: any, message: any, length: any, userData: any) =>
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
	 */
	onFriendStatusChange(callback: (tox: any, contactId: number, status: number, userData: any) => void)
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
	 */
	onFriendStatusMessageChange(callback: (tox: any, id: number, message: string, length: number, userData: any) => void)
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
	 */
	onFriendNameChange(callback: (tox: any, id: number, name: string, length: number, userData: any) => void)
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
	 */
	onFriendConnectionStatusChange(callback: (tox: any, id: number, connectionStatus: number, userData: any) => void)
	{
		const cb = ffi.Callback('void', [types.toxPtr, 'int', "int", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_connection_status(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Received file transfer request from friend
	 */
	onFileReceive(callback: (friendId: number, fileId: number, size: number, name: string, isAvatar: boolean) => void)
	{
		this.addEventListener("fileRecv", (dataPtr) => {
			const fileNameBuffer = libtoxcore.tox_event_file_recv_get_filename(dataPtr);
			const fileNameBufferLength = libtoxcore.tox_event_file_recv_get_filename_length(dataPtr);
			const fileName = ref.reinterpret(fileNameBuffer, fileNameBufferLength, 0).toString("utf8");
			const fileId = libtoxcore.tox_event_file_recv_get_file_number(dataPtr);
			const fileSize = libtoxcore.tox_event_file_recv_get_file_size(dataPtr);
			const friendId = libtoxcore.tox_event_file_recv_get_friend_number(dataPtr);
			const fileKind = libtoxcore.tox_event_file_recv_get_kind(dataPtr);
			const isAvatar = fileKind == ToxFileKind.TOX_FILE_KIND_AVATAR;

			callback(friendId, fileId, fileSize, fileName, isAvatar);
		});
	}

	/**
	 * Received a file chunk from friend. On final chunk length is 0 and data is null
	 */
	onFileReceiveChunk(callback: (friendId: number, fileId: number, position: number, data: Buffer, length: number) => void)
	{
		this.addEventListener("fileRecvChunk", (dataPtr) => {
			const chunkDataPtr = libtoxcore.tox_event_file_recv_chunk_get_data(dataPtr);
			const chunkLength = libtoxcore.tox_event_file_recv_chunk_get_length(dataPtr);
			const fileId = libtoxcore.tox_event_file_recv_chunk_get_file_number(dataPtr);
			const friendId = libtoxcore.tox_event_file_recv_chunk_get_friend_number(dataPtr);
			const position = libtoxcore.tox_event_file_recv_chunk_get_position(dataPtr);
			const fileDataPtr = Buffer.from(ref.reinterpret(chunkDataPtr, chunkLength));

			callback(friendId, fileId, position, fileDataPtr, chunkLength);
		});
	}

	/**
	 * Received a file control message from friend
	 */
	onFileReceiveControlMsg(callback: (friendId: number, fileId: number, messageType: number) => void)
	{
		this.addEventListener("fileRecvControl", (dataPtr) => {
			const friendId = libtoxcore.tox_event_file_recv_control_get_friend_number(dataPtr);
			const fileId = libtoxcore.tox_event_file_recv_control_get_file_number(dataPtr);
			const messageType = libtoxcore.tox_event_file_recv_control_get_control(dataPtr);

			callback(friendId, fileId, messageType);
		});
	}

	/**
	 * Received a file chunk request from friend
	 */
	onFileReceiveChunkRequest(callback: (friendId: number, fileId: number, position: number, size: number) => void)
	{
		this.addEventListener("fileChunkRequest", (dataPtr) => {
			const friendId = libtoxcore.tox_event_file_chunk_request_get_friend_number(dataPtr);
			const fileId = libtoxcore.tox_event_file_chunk_request_get_file_number(dataPtr);
			const position = libtoxcore.tox_event_file_chunk_request_get_position(dataPtr);
			const size = libtoxcore.tox_event_file_chunk_request_get_length(dataPtr);

			callback(friendId, fileId, position, size);
		});
	}

	/**
	 * Received a message from a contact
	 */
	onMessageReceive(callback: (tox: any, contactId: number, messageType: number, message: string, length: number, userData: any) => void)
	{
		const cb = ffi.Callback('void', [types.toxPtr, "int", "int", "string", "size_t", types.userDataPtr], callback);
		libtoxcore.tox_callback_friend_message(this.tox, cb);
		process.on("exit", () =>
		{
			cb
		});
	}

	/**
	 * Sends a file transfer control message to friend - used to accept / pause / reject file transfers
	 */
	sendFileControlMsg(friendId: number, fileId: number, type: number): boolean
	{
		console.log("Sending control", friendId, fileId, ToxFileControl[type]);
		const error = ref.alloc("int");
		return libtoxcore.tox_file_control(this.tox, friendId, fileId, type, error);
	}

	/**
	 * Accept file transfer from friend
	 */
	acceptFileTransfer(friendId: number, fileId: number)
	{
		this.sendFileControlMsg(friendId, fileId, ToxFileControl.TOX_FILE_CONTROL_RESUME);
	}

	/**
	 * Reject file transfer from friend
	 */
	rejectFileTransfer(friendId: number, fileId: number)
	{
		this.sendFileControlMsg(friendId, fileId, ToxFileControl.TOX_FILE_CONTROL_CANCEL);
	}

	/**
	 * Gets contacts of this Tox instance
	 * @returns {Uint32Array} contacts
	 */
	getContacts(): Uint32Array
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
	 * @returns {number} friendId
	 */
	acceptFriendRequest(publicKey: string): number
	{
		const buffer = Buffer.from(publicKey, "hex");
		const view = new Uint8Array(buffer);
		let err = ref.alloc("int");
		return libtoxcore.tox_friend_add_norequest(this.tox, view, err);
	}

	/**
	 * Gets contact's username
	 * @param {number} id friend id
	 * @returns {string} username
	 */
	getContactName(id: number): string
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
	getContactStatusMessage(id: number): string
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
	 * Gets friend's public key
	 * @param {number} id friend id
	 * @returns {string} friend's public key
	 */
	getContactPublicKey(id: number): string
	{
		let err = ref.alloc("int");
		const buffer = new ArrayBuffer(32);
		const view = new Uint8Array(buffer);
		libtoxcore.tox_friend_get_public_key(this.tox, id, view, err);
		return Buffer.from(view).toString("hex");
	}

	/**
	 * Send a message to friend
	 */
	sendMessage(friendId: number, message: string)
	{
		const messageType = 0; // normal message
		const errorPtr = ref.alloc("int");
		const buffer = Buffer.from(message, "utf8");
		libtoxcore.tox_friend_send_message(this.tox, friendId, messageType, buffer, buffer.length, errorPtr);
	}

	/**
	 * Sends a friend request
	 * @returns {number} friendId
	 */
	sendFriendRequest(toxId: string, message: string): number
	{
		const buffer = Buffer.from(toxId, "hex");
		const view = new Uint8Array(buffer);
		const messageBuffer = Buffer.from(message, "utf8");
		const err = ref.alloc("int");

		return libtoxcore.tox_friend_add(this.tox, view, messageBuffer, messageBuffer.length, err);
	}

	/**
	 * Removes contact from friend list
	 * @param {number} friendId
	 * @returns {boolean} true on success
	 */
	removeContact(friendId: number): boolean
	{
		const err = ref.alloc("int");
		return libtoxcore.tox_friend_delete(this.tox, friendId, err);
	}

	/**
	 * Send file to friend
	 * @returns {number} A file number used as an identifier in subsequent callbacks. This
	 * 	number is per friend. File numbers are reused after a transfer terminates.
	 * 	On failure, this function returns an unspecified value. Any pattern in file numbers
	 * 	should not be relied on.
	 */
	sendFile(friendId: number, isAvatar: boolean, fileName: string, fileSize: number, fileId: number | null = null): number
	{
		const err = ref.alloc("int");
		let fileKind = ToxFileKind.TOX_FILE_KIND_DATA;
		if (isAvatar)
			fileKind = ToxFileKind.TOX_FILE_KIND_AVATAR;
		const fileNameBuffer = Buffer.from(fileName, "utf8");

		return libtoxcore.tox_file_send(this.tox, friendId, fileKind, fileSize, fileId, fileNameBuffer, fileNameBuffer.length, err);
	}

	/**
	 * Send file chunk to friend
	 * @returns {boolean} true on success
	 */
	sendFileChunk(friendId: number, fileId: number, position: number, data: Buffer | null = null): boolean
	{
		const err = ref.alloc("int");
		let length = 0;
		if (data != null)
			length = data.length;

		return libtoxcore.tox_file_send_chunk(this.tox, friendId, fileId, position, data, length, err);
	}

	// TODO: add tox hash function to use it on avatars
	tox_hash(data: any)
	{

	}
}

export default Tox;