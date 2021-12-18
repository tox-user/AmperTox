import "./index.css";
import initComponents from "./components";
const connectionSpinner = document.querySelector("#connection-spinner");
const connectionStatusText = document.querySelector("#connection-status");
const statusMessageText = document.querySelector("#status-message");
const usernameText = document.querySelector("#username");
const contactList = document.querySelector("#contact-list");
const messenger = document.querySelector("#messenger");
const welcome = document.querySelector("#welcome");
let contacts = [];
let activeContact = null;
let username = "";
let publicKey = "";
let assetsPath = "";

function loadInitialData(data)
{
	username = data.username;
	publicKey = data.publicKey;

	usernameText.textContent = username;
	usernameText.title = username;
	statusMessageText.textContent = data.statusMessage;
	statusMessageText.title = data.statusMessage;

	sessionStorage.setItem("avatarsPath", data.avatarsSaveDir);
	assetsPath = data.assetsPath;
	sessionStorage.setItem("assetsPath", assetsPath);

	contacts = data.contacts;
	contactList.update(contacts, activeContact);
}

function updateMessenger(contactId)
{
	if (activeContact == contactId)
	{
		const contact = contacts.find(c => c.id == activeContact);
		messenger.update(contact, null, username, publicKey);
	}
}

function updateContactStatus(contactId, status)
{
	let index = contacts.findIndex((contact) => contact.id == contactId);
	contacts[index].status = status;
	contactList.update(contacts, activeContact);
	updateMessenger(contactId);
}

function updateContactStatusMessage(contactId, message)
{
	let index = contacts.findIndex((contact) => contact.id == contactId);
	contacts[index].statusMessage = message;
	contactList.update(contacts, activeContact);
	updateMessenger(contactId);
}

function updateContactName(contactId, name)
{
	let index = contacts.findIndex((contact) => contact.id == contactId);
	contacts[index].name = name;
	contactList.update(contacts, activeContact);
	updateMessenger(contactId);
}

function updateContactConnectionStatus(contactId, connectionStatus)
{
	let index = contacts.findIndex((contact) => contact.id == contactId);
	contacts[index].connectionStatus = connectionStatus;
	contactList.update(contacts, activeContact);
	updateMessenger(contactId);
}

function updateContactAvatar(contactId)
{
	contactList.update(contacts, activeContact);
	updateMessenger(contactId);
}

function clearStatus()
{
	if (!connectionSpinner.classList.contains("hidden"))
		connectionSpinner.classList.add("hidden");

	if (connectionStatusText.classList.contains("online"))
		connectionStatusText.classList.remove("online");

	if (connectionStatusText.classList.contains("away"))
		connectionStatusText.classList.remove("away");

	if (connectionStatusText.classList.contains("busy"))
		connectionStatusText.classList.remove("busy");

	if (connectionStatusText.classList.contains("offline"))
		connectionStatusText.classList.remove("offline");
}

function addContact(contact)
{
	contacts.push(contact);
	contactList.update(contacts, activeContact);
}

function removeContact(contactId)
{
	const index = contacts.findIndex((contact) => contact.id == contactId);
	contacts.splice(index, 1);
	if (activeContact == contactId)
		activeContact = null;

	contactList.update(contacts, activeContact);
}

function addMessage(message)
{
	playAudioNotification();

	if (activeContact == message.contactId)
	{
		messenger.addMessage(message);
	} else
	{
		const index = contacts.findIndex(c => c.id == message.contactId);
		contacts[index].numUnreadMessages++;
		contactList.updateContact(contacts[index]);
	}
}

function contactSelected(e)
{
	let contact = e.detail;
	if (activeContact != contact.id)
	{
		activeContact = contact.id;
		window.ipc.send("messages-request", contact.id);
	}

	if (!messenger.isVisible)
	{
		messenger.show();
		welcome.hide();
	}
}

function loadMessages(messages)
{
	const contact = contacts.find(c => c.id == activeContact);
	messenger.update(contact, messages, username, publicKey, messages.length <= 20);
}

function sendMessage(e)
{
	const data = {contactId: activeContact, message: e.detail};
	window.ipc.send("send-message", data);

	const contact = {id: -1, name: username};
	const message =
	{
		contactId: contact.id,
		message: e.detail,
		date: new Date()
	};
	messenger.addMessage(message);
}

function sendFile(e)
{
	const file = e.detail;
	window.ipc.send("send-file", {
		contactId: activeContact,
		filePath: file.path,
		fileName: file.name,
		fileSize: file.size
	});

	const contact = {id: -1, name: username};
	const message =
	{
		contactId: contact.id,
		message: "FILE TRANSFER",
		date: new Date()
	};
	messenger.addMessage(message);
}

function playAudioNotification()
{
	if (!document.hasFocus())
		new Audio(`${assetsPath}/incoming-message.wav`).play();
}

window.ipc.on("data", (data) => loadInitialData(data));

window.ipc.on("connection-status-change", (status) =>
{
	clearStatus();

	if (status != 0)
	{
		connectionStatusText.classList.add("online");
		connectionStatusText.textContent = "Online";
	} else
	{
		if (connectionSpinner.classList.contains("hidden"))
			connectionSpinner.classList.remove("hidden");

		if (!connectionSpinner.classList.contains("offline"))
			connectionStatusText.classList.add("offline");

		connectionStatusText.textContent = "Offline";
	}
});

window.ipc.on("friend-status-change", (data) => updateContactStatus(data.contactId, data.status));
window.ipc.on("friend-status-message-change", (data) => updateContactStatusMessage(data.contactId, data.message));
window.ipc.on("friend-name-change", (data) => updateContactName(data.contactId, data.name));
window.ipc.on("friend-connection-status-change", (data) => updateContactConnectionStatus(data.contactId, data.connectionStatus));
window.ipc.on("friend-avatar-receive", (data) => updateContactAvatar(data.contactId));
window.ipc.on("message", (message) => addMessage(message));
window.ipc.on("messages-loaded", (data) => loadMessages(data));
window.ipc.on("add-contact", addContact);
window.ipc.on("remove-contact", (data) => removeContact(data.contactId));
window.ipc.on("friend-request", playAudioNotification);
window.ipc.send("data-request");
initComponents();
contactList.addEventListener("contactselect", contactSelected);
messenger.addEventListener("sendmessage", sendMessage);
messenger.addEventListener("sendfile", sendFile);