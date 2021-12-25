import "./index.css";
import initComponents from "./components";
const messenger = document.querySelector("#messenger");
const welcome = document.querySelector("#welcome");
const sidebar = document.querySelector("ui-sidebar");
let username = "";
let publicKey = "";
let assetsPath = "";

function loadInitialData(data)
{
	username = data.username;
	publicKey = data.publicKey;
	sessionStorage.setItem("avatarsPath", data.avatarsSaveDir);
	assetsPath = data.assetsPath;
	sessionStorage.setItem("assetsPath", assetsPath);
	sessionStorage.setItem("publicKey", publicKey);
}

function contactSelected(e)
{
	messenger.updateContact(e.detail);

	if (!messenger.isVisible)
	{
		messenger.show();
		welcome.hide();
	}
}

function loadMessages(messages)
{
	messenger.updateMessages(messages, username, publicKey, messages.length <= 20);
}

function sendMessage(e)
{
	const data = {contactId: sidebar.contactListElement.activeContact, message: e.detail};
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
		contactId: sidebar.contactListElement.activeContact,
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

window.ipc.on("data", (data) => loadInitialData(data));
window.ipc.on("messages-loaded", (messages) => loadMessages(messages));
window.ipc.send("data-request");
initComponents();
sidebar.contactListElement.addEventListener("contactselect", contactSelected);
messenger.addEventListener("sendmessage", sendMessage);
messenger.addEventListener("sendfile", sendFile);