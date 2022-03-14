const { app, Notification } = require("electron");
const Tox = require("../api/tox");
const ToxErrNew = require("../models/tox/errNew");
const ToxConnection = require("../models/tox/connection");
const ToxUserStatus = require("../models/tox/userStatus");
const ToxErrBootstrap = require("../models/tox/errBootstrap");
const ToxOptions = require("../models/tox/options");
const Config = require("./config");
const Contact = require("../models/contact");
const fs = require("fs");
const FileControl = require("../models/tox/fileControl");
const storage = require("./storage");
const Message = require("../models/message");
const path = require("path");
const FileTransfer = require('../models/fileTransfer');
const { findFileTransferIndex } = require('./fileTransfer');
const url = require("url");
const ProxyType = require("../models/tox/proxyType");

const DATA_DIR = path.resolve(app.getPath("appData"), "tox");
const AVATARS_SAVE_DIR = path.resolve(DATA_DIR, "avatars");
const DOWNLOAD_DIR = app.getPath("downloads");
const MAX_NOTIFICATION_LENGTH = 200;
const MAX_AVATAR_SIZE = 20 * 1024 * 1024;
const NOTIFICATION_ICON_PATH = "../../assets/icon/128.png";

class Client
{
	/**
	 * @param {string} profileName
	 * @param {BrowserWindow} window
	 */
	constructor(profileName="", window)
	{
		this.profileName = profileName;
		this.window = window;
		this.prevConnection = ToxConnection.TOX_CONNECTION_NONE.value;
		this.isConnected = false;
		this.tox = null;
		this.config = Config.load();
		this.fileTransfers = [];
	}

	/**
	 * Returns a promise that completes after specified amount of miliseconds
	 * @param {number} ms amount of miliseconds to wait
	 * @returns {Promise}
	 */
	static sleep(ms)
	{
		return new Promise((resolve) =>
		{
			setTimeout(resolve, ms);
		});
	}

	/**
	 * Tox loop
	 */
	async loop()
	{
		try
		{
			await Client.sleep(this.tox.getIterationInterval());
			this.tox.eventsIterate();
			this.loop();

		} catch (e)
		{
			console.log(e);
		}
	}

	/**
	 * Called when client is finished creating a Tox instance
	 * @param {() => void} callback
	 */
	onReady(callback)
	{
		this.createTox().then(callback);
	}

	/**
	 * Loads user's Tox profile and creates Tox instance
	 * @returns {Promise}
	 */
	createTox()
	{
		return new Promise((resolve) =>
		{
			let proxyType = ProxyType.TOX_PROXY_TYPE_NONE.value;
			if (this.config.network.proxy.enabled)
			{
				switch (this.config.network.proxy.type)
				{
					case "socks5":
						proxyType = ProxyType.TOX_PROXY_TYPE_SOCKS5.value;
						break;
					case "http":
						proxyType = ProxyType.TOX_PROXY_TYPE_HTTP.value;
						break;
					default:
						proxyType = ProxyType.TOX_PROXY_TYPE_NONE.value;
						break;
				}
			}

			const options = new ToxOptions({
				udp_enabled: this.config.network.udp,
				local_discovery_enabled: this.config.network.udp, // enable local discovery for udp
				ipv6_enabled: this.config.network.ipv6,
				proxy_type: proxyType,
				proxy_host: this.config.network.proxy.address,
				proxy_port: this.config.network.proxy.port,
				tcp_port: 0 // disable tcp relay
			});

			if (this.profileName == "")
				this.profileName = this.config.lastUsedProfile;
			else
				this.config.lastUsedProfile = this.profileName;

			// if profile name is not provided by the user, we create a new profile
			// in the future we should show a login screen instead
			if (this.profileName == "")
			{
				this.tox = new Tox(options);
				this.profileName = this.tox.uniqueProfileName(DATA_DIR, "profile");
				this.config.lastUsedProfile = this.profileName;
				console.log("Created new profile:", this.profileName);
				resolve();
			} else
			{
				const profilePath = path.resolve(DATA_DIR, this.profileName);
				Tox.load(profilePath).then((profileData) =>
				{
					console.log("Loaded profile");

					options.savedata_type = 1;
					options.savedata_length = profileData.length;
					options.savedata_data = profileData;

					this.tox = new Tox(options);
					resolve();
				});
			}
		});
	}

	/**
	 * Starts the client
	 */
	start()
	{
		let errorValue = this.tox.error.deref();
		if (errorValue != ToxErrNew.TOX_ERR_NEW_OK.value)
			throw new Error("Error creating Tox instance " + ToxErrNew.get(errorValue).key);

		console.log("ID:", this.tox.address);

		// setup callbacks
		let self = this;
		this.tox.onConnectionStatusChange((tox, connectionStatus, userData) =>
			this.connectionStatusChanged(connectionStatus)
		);
		this.tox.onFriendRequest((tox, publicKey, message, length, userData) =>
			this.friendRequestReceived(tox, publicKey, message, length, userData, self)
		);
		this.tox.onFriendStatusChange((tox, id, status, userData) =>
			this.friendStatusChanged(tox, id, status, userData, self)
		);
		this.tox.onFriendStatusMessageChange((tox, id, message, length, userData) =>
			this.friendStatusMessageChanged(tox, id, message, length, userData, self)
		);
		this.tox.onFriendNameChange((tox, id, name, length, userData) =>
			this.friendNameChanged(tox, id, name, length, userData, self)
		);
		this.tox.onFriendConnectionStatusChange((tox, id, connectionStatus, userData) =>
			this.friendConnectionStatusChanged(tox, id, connectionStatus, userData, self)
		);
		this.tox.onFileReceiveControlMsg((friendId, fileId, messageType) =>
			this.fileReceivedControlMsg(friendId, fileId, messageType)
		);
		this.tox.onFileReceiveChunkRequest((friendId, fileId, position, size) =>
			this.fileReceivedChunkRequest(friendId, fileId, position, size)
		);
		this.tox.onMessageReceive((tox, contactId, messageType, message, length, userData) =>
			this.messageReceived(tox, contactId, messageType, message, length, userData, self)
		);
		this.tox.onFileReceive((friendId, fileId, fileSize, fileName, isAvatar) =>
			this.fileReceived(friendId, fileId, fileSize, fileName, isAvatar)
		);
		this.tox.onFileReceiveChunk((friendId, fileId, position, fileDataPtr, chunkLength) =>
			this.fileReceivedChunk(friendId, fileId, position, fileDataPtr, chunkLength)
		);

		// connect to DHT
		const isConnecting = this.tox.connect("85.172.30.117", 33445, "8E7D0B859922EF569298B4D261A8CCB5FEA14FB91ED412A7603A585A25698832");
		console.log("Bootstrapping...", isConnecting, ToxErrBootstrap.get(this.tox.bootstrapError.deref()).key);

		// create a DB for user if it wasn't created yet
		const dbPath = path.resolve(DATA_DIR, `${this.profileName}.db`);
		storage.open(dbPath).then(() => storage.createTables());

		this.loop();
	}

	/**
	 * Closes the app
	 * @param {Client} self
	 */
	async exit(self)
	{
		console.log("\nExiting...");
		await Promise.all([
			self.tox.save(path.resolve(DATA_DIR, self.profileName)),
			Config.save(self.config),
			storage.close()
		]);

		app.quit();
	}

	// we have connected / disconnected
	connectionStatusChanged(connectionStatus)
	{
		if (connectionStatus != ToxConnection.TOX_CONNECTION_NONE.value && this.prevConnection == ToxConnection.TOX_CONNECTION_NONE.value)
		{
			console.log("Connected to DHT");
			this.isConnected = true;

		} else if (connectionStatus == ToxConnection.TOX_CONNECTION_NONE.value && this.prevConnection != ToxConnection.TOX_CONNECTION_NONE.value)
		{
			console.log("Disconnected");
			this.isConnected = false;
		}

		this.prevConnection = connectionStatus;

		const status = this.tox.getStatus();
		this.window.webContents.send("status-change", {connectionStatus, status});
	}

	friendRequestReceived(tox, publicKey, message, length, userData, self)
	{
		console.log("Friend request from", publicKey);
		self.window.webContents.send("friend-request", {publicKey: publicKey, message: message});

		if (!self.window.isFocused())
		{
			const notification = new Notification({title: "New Friend Request", icon: path.resolve(__dirname, NOTIFICATION_ICON_PATH)});
			notification.on("click", () => self.window.focus());
			notification.show();
		}
	}

	acceptFriendRequest(event, data, self)
	{
		const contactId = self.tox.acceptFriendRequest(data.publicKey);
		self.window.webContents.send("add-contact", this.createContact(contactId));
		self.window.webContents.send("remove-friend-request");
	}

	declineFriendRequest(event, data, self)
	{
		self.window.webContents.send("remove-friend-request");
	}

	// send message to contact
	sendMessage(event, data, self)
	{
		self.tox.sendMessage(data.contactId, data.message);
		const contactPk = self.tox.getContactPublicKey(data.contactId);
		storage.addMessage(contactPk, data.message, self.tox.publicKey, new Date().getTime());
	}

	// start file transfer with contact
	sendFile(contactId, filePath, fileName, fileSize, isAvatar, self)
	{
		console.log("Sending file", fileName);

		const fileId = self.tox.sendFile(contactId, isAvatar, fileName, fileSize);
		fs.open(filePath, "r", (err, fd) =>
		{
			if (err)
			{
				console.error("Error while opening file", err.message);
				return;
			}

			self.fileTransfers.push(new FileTransfer(fileId, fd, fileName, contactId, isAvatar));
		});
	}

	friendStatusChanged(tox, id, status, userData, self)
	{
		self.window.webContents.send("friend-status-change", {id: id, status: status});
	}

	friendStatusMessageChanged(tox, id, message, length, userData, self)
	{
		self.window.webContents.send("friend-status-message-change", {id: id, statusMessage: message});
	}

	friendNameChanged(tox, id, name, length, userData, self)
	{
		self.window.webContents.send("friend-name-change", {id: id, name: name});
	}

	// friend has connected / disconnected
	friendConnectionStatusChanged(tox, id, connectionStatus, userData, self)
	{
		self.window.webContents.send("friend-connection-status-change", {id: id, connectionStatus: connectionStatus});

		// send our avatar when friend became online
		// TODO: make sure previous status was 0 (offline)
		if (connectionStatus > 0)
		{
			console.log("Sending avatar", connectionStatus, id);
			const fileName = `${self.tox.publicKey.toUpperCase()}.png`;
			const filePath = path.resolve(AVATARS_SAVE_DIR, fileName);

			// get avatar file size
			fs.stat(filePath, (err, stats) =>
			{
				if (err) // avatars are optional, so it's fine if this file doesn't exist
					return;

				self.sendFile(id, filePath, fileName, stats.size, true, self);
			});
		}
	}

	// file transfer was initiated by friend
	fileReceived(friendId, fileId, size, name, isAvatar)
	{
		console.log("Incoming file transfer", name);

		// reject if auto-rejection is enabled
		if ((this.config.fileTransfers.rejectFiles && !isAvatar) || this.config.fileTransfers.rejectAvatars && isAvatar)
		{
			this.tox.rejectFileTransfer(friendId, fileId);
			return;
		}

		let saveDir = DOWNLOAD_DIR;
		if (isAvatar)
		{
			// reject avatars that are too big
			if (size > MAX_AVATAR_SIZE)
			{
				console.log("Incoming avatar file is too big, rejecting");
				this.tox.rejectFileTransfer(friendId, fileId);
				return;
			}

			const contactPk = this.tox.getContactPublicKey(friendId);
			name = `${contactPk.toUpperCase()}.png`;
			saveDir = AVATARS_SAVE_DIR;
		}

		const safeName = name.replace("/", "").replace("\\", "");
		const filePath = path.resolve(saveDir, safeName);

		try
		{
			const fd = fs.openSync(filePath, "w");
			this.fileTransfers.push(new FileTransfer(fileId, fd, safeName, friendId, isAvatar));
			this.tox.acceptFileTransfer(friendId, fileId);
		} catch (err)
		{
			console.error("Error while trying to access path", err.message);
		}
	}

	// received file chunk from friend
	// order of packets is guaranteed by toxcore
	// on final chunk length is 0 and data is null
	fileReceivedChunk(friendId, fileId, position, data, length)
	{
		const index = findFileTransferIndex(this.fileTransfers, fileId, friendId);
		if (index < 0)
			return;

		if (length > 0) // transfer isn't finished
		{
			try
			{
				fs.writeSync(this.fileTransfers[index].fd, data, 0, length, position);
			} catch (err)
			{
				console.error("Error while writing to disk", err.message);
			}
		} else
		{
			console.log("File transfer complete");
			fs.close(this.fileTransfers[index].fd, (err) =>
			{
				if (err)
					console.error("Error while closing file", err.message);

				if (this.fileTransfers[index].isAvatar)
					this.window.webContents.send("friend-avatar-receive", {id: friendId});

				this.fileTransfers.splice(index, 1);
			});
		}
	}

	// received file control message from friend
	fileReceivedControlMsg(friendId, fileId, messageType)
	{
		console.log("File control message received", FileControl.enums[messageType].key);

		const index = findFileTransferIndex(this.fileTransfers, fileId, friendId);
		if (index < 0)
			return;

		if (messageType == FileControl.TOX_FILE_CONTROL_CANCEL.value)
		{
			fs.close(this.fileTransfers[index].fd, (err) =>
			{
				if (err)
					console.error("Error while closing file", err.message);

				this.fileTransfers.splice(index, 1);
			});
		}
	}

	// received file chunk request from friend
	fileReceivedChunkRequest(friendId, fileId, position, size)
	{
		const index = findFileTransferIndex(this.fileTransfers, fileId, friendId);
		if (index < 0)
			return;

		if (size > 0)
		{
			try
			{
				const data = Buffer.alloc(size);
				fs.readSync(this.fileTransfers[index].fd, data, 0, data.length, position);
				this.tox.sendFileChunk(friendId, fileId, position, data);
			} catch (err)
			{
				console.error("Error while reading from file", err.message);
			}
		} else
		{
			console.log("File sent successfully");

			fs.close(this.fileTransfers[index].fd, (err) =>
			{
				if (err)
					console.error("Error while closing file", err.message);

				this.fileTransfers.splice(index, 1);
			});
		}
	}

	// message received from our contact
	messageReceived(tox, contactId, messageType, message, length, userData, self)
	{
		const contactPk = self.tox.getContactPublicKey(contactId);
		const date = new Date();
		const timestamp = date.getTime();
		storage.addMessage(contactPk, message, contactPk, timestamp);
		self.window.webContents.send("message", new Message(contactId, message, date));

		if (!self.window.isFocused())
		{
			const contactName = self.tox.getContactName(contactId);
			const title = `Message from ${contactName}`;
			let body = message;
			if (body.length > MAX_NOTIFICATION_LENGTH)
				body = body.substring(0, MAX_NOTIFICATION_LENGTH - 1);

			const notification = new Notification({title: title, body: body, icon: path.resolve(__dirname, NOTIFICATION_ICON_PATH)});
			notification.on("click", () => self.window.focus());
			notification.show();
		}
	}

	/**
	 * Gets contact data by contactId
	 * @param {number} id contact id
	 * @returns {Contact} contact object
	 */
	createContact(id)
	{
		const name = this.tox.getContactName(id);
		const status = ToxUserStatus.TOX_USER_STATUS_NONE.value;
		const statusMessage = this.tox.getContactStatusMessage(id);
		const connectionStatus = ToxConnection.TOX_CONNECTION_NONE.value;
		const pk = this.tox.getContactPublicKey(id);
		return new Contact(id, name, status, statusMessage, connectionStatus, pk);
	}

	// send initial data to the view
	sendDataToRenderer(event, self)
	{
		let contacts = [];
		self.tox.contacts.forEach((id) => contacts.push(self.createContact(id)));

		event.sender.send("data",
		{
			username: self.tox.username,
			statusMessage: self.tox.statusMessage,
			publicKey: self.tox.publicKey,
			contacts: contacts,
			avatarsSaveDir: url.pathToFileURL(AVATARS_SAVE_DIR).toString(),
			assetsPath: path.resolve(app.getAppPath(), "assets")
		});
	}

	// get messages from DB for specified contact
	async loadMessages(event, contactId, amount=20, self)
	{
		const contactPk = self.tox.getContactPublicKey(contactId);
		const rows = await storage.getMessages(contactPk, amount);
		const messages = rows.map(message =>
		{
			let newContactId = contactId;
			if (message.owner_pk == self.tox.publicKey)
				newContactId = -1;

			return new Message(newContactId, message.message, new Date(message.timestamp))
		});

		self.window.webContents.send("messages-loaded", messages);
	}

	sendFriendRequest(event, toxId, message, self)
	{
		const contactId = self.tox.sendFriendRequest(toxId, message);
		self.window.webContents.send("add-contact", this.createContact(contactId));
	}

	removeContact(event, contactId, self)
	{
		const success = self.tox.removeContact(contactId);
		if (success)
			self.window.webContents.send("remove-contact", {id: contactId});
		else
			console.error("Error while removing contact");
	}
}

module.exports = Client;