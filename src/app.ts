import { app, BrowserWindow, ipcMain, shell } from "electron";
import Client from "./client/client";
import path from "path";
import { URL } from "url";
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
		icon: path.resolve(__dirname, "../assets/icon/128.png"),
		autoHideMenuBar: true,
		backgroundColor: "rgb(26, 24, 23)",
		titleBarStyle: useCustomTitleBar ? "hidden" : "default",
		titleBarOverlay: useCustomTitleBar ? {
			color: "rgb(15, 14, 13)",
			symbolColor: "rgba(255, 255, 255, 0.7)",
			height: 33
		} : false,
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
	}).catch((err: any) =>
	{
		console.error("Couldn't load the UI", err.message);
	});

	const client = new Client(profileName, win);
	client.onReady(() =>
	{
		ipcMain.on("data-request", () => client.sendDataToRenderer(client));
		ipcMain.on("accept-friend-request", (event, arg) => client.acceptFriendRequest(arg, client));
		ipcMain.on("decline-friend-request", (event, arg) => client.declineFriendRequest(arg, client));
		ipcMain.on("send-message", (event, arg) => client.sendMessage(arg, client));
		ipcMain.on("send-file", (event, arg) => client.sendFile(arg.contactId, arg.filePath, arg.fileName, arg.fileSize, false, client));
		ipcMain.on("messages-request", (event, arg) => client.loadMessages(arg, undefined, client));
		ipcMain.on("load-more-messages", (event, arg) => client.loadMessages(arg.contactId, arg.amount, client));
		ipcMain.on("send-friend-request", (event, arg) => client.sendFriendRequest(arg.toxId, arg.message, client));
		ipcMain.on("remove-contact", (event, arg) => client.removeContact(arg.contactId, client));
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
		return { action: "deny" };
	});
});

app.whenReady().then(createWindow);