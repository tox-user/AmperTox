const { app, BrowserWindow, ipcMain } = require("electron");
const Client = require("./src/client/client");
const path = require("path");
require('events').EventEmitter.defaultMaxListeners = 15;
let profileName = "";

function parseArgs()
{
	for (let i = 0; i < process.argv.length; i++)
	{
		if (process.argv[i] == "--profile" && i + 1 < process.argv.length)
		{
			profileName = process.argv[i + 1];
		}
	}
}

function createWindow()
{
	const win = new BrowserWindow({
		width: 1024,
		height: 768,
		icon: path.resolve(__dirname, "assets/logo.png"),
		autoHideMenuBar: true,
		webPreferences:
		{
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, "preload.js")
		}
	});

	win.loadFile("./dist/index.html");

	const client = new Client(profileName, win);
	client.onReady(() =>
	{
		ipcMain.on("data-request", (event) => client.sendDataToRenderer(event, client));
		ipcMain.on("accept-friend-request", (event, arg) => client.acceptFriendRequest(event, arg, client));
		ipcMain.on("send-message", (event, arg) => client.sendMessage(event, arg, client));
		ipcMain.on("messages-request", (event, arg) => client.loadMessages(event, arg, undefined, client));
		ipcMain.on("load-more-messages", (event, arg) => client.loadMessages(event, arg.contactId, arg.amount, client));
		process.on("SIGINT", () => client.exit(client));
		app.on("window-all-closed", () => client.exit(client));

		client.start();
	});
}

parseArgs();
app.whenReady().then(createWindow);