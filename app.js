const { app, BrowserWindow, ipcMain, shell } = require("electron");
const Client = require("./src/client/client");
const path = require("path");
const URL = require("url").URL;
require('events').EventEmitter.defaultMaxListeners = 15;
let profileName = "";

function parseArgs()
{
	for (let i = 0; i < process.argv.length; i++)
	{
		const curArg = process.argv[i];
		if (curArg == "--profile" || curArg == "-p" && i + 1 < process.argv.length)
		{
			profileName = process.argv[i + 1];
		}
	}
}

function createWindow()
{
	// use a custom title bar with native window controls
	// unfortunately Electron doesn't add such controls on GNU/Linux
	// so we can only use a custom title bar on Windows and MacOS
	const useCustomTitleBar = process.platform == "win32" || process.platform == "darwin";

	const win = new BrowserWindow({
		width: 1200,
		height: 768,
		icon: path.resolve(__dirname, "assets/icon/128.png"),
		autoHideMenuBar: true,
		backgroundColor: "#1a1715",
		frame: !useCustomTitleBar,
		titleBarOverlay: useCustomTitleBar,
		webPreferences:
		{
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, "preload.js"),
			sandbox: true
		}
	});

	// this should disable some networking features for the renderer
	win.webContents.session.enableNetworkEmulation({offline: true});

	// set nonexistent proxy address to (hopefully) disable internet connection for the renderer process (just in case)
	win.webContents.session.setProxy({proxyRules: "socks5://0.0.0.0"}).then(() =>
	{
		// load the UI
		win.loadFile("./dist/index.html");
	}).catch((err) =>
	{
		console.error("Couldn't load the UI", err.message);
	});

	const client = new Client(profileName, win);
	client.onReady(() =>
	{
		ipcMain.on("data-request", (event) => client.sendDataToRenderer(event, client));
		ipcMain.on("accept-friend-request", (event, arg) => client.acceptFriendRequest(event, arg, client));
		ipcMain.on("decline-friend-request", (event, arg) => client.declineFriendRequest(event, arg, client));
		ipcMain.on("send-message", (event, arg) => client.sendMessage(event, arg, client));
		ipcMain.on("send-file", (event, arg) => client.sendFile(arg.contactId, arg.filePath, arg.fileName, arg.fileSize, false, client));
		ipcMain.on("messages-request", (event, arg) => client.loadMessages(event, arg, undefined, client));
		ipcMain.on("load-more-messages", (event, arg) => client.loadMessages(event, arg.contactId, arg.amount, client));
		ipcMain.on("send-friend-request", (event, arg) => client.sendFriendRequest(event, arg.toxId, arg.message, client));
		ipcMain.on("remove-contact", (event, arg) => client.removeContact(event, arg.contactId, client));
		process.on("SIGINT", () => client.exit(client));
		app.on("window-all-closed", () => client.exit(client));

		client.start();
	});
}

parseArgs();

app.on("web-contents-created", (event, contents) =>
{
	// open all links in external browser instead of electron
	contents.on("will-navigate", (event, navigationUrl) =>
	{
		event.preventDefault();

		const parsedUrl = new URL(navigationUrl);
		if (parsedUrl.protocol == "http:" || parsedUrl.protocol == "https:")
		{
			shell.openExternal(navigationUrl);
		}
	});

	// forbid creation of additional windows
	contents.setWindowOpenHandler(() =>
	{
		return {action: "deny"};
	});
});

app.whenReady().then(createWindow);