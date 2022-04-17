import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
  'ipc', {
    send: (channel: any, data: any) => {
		ipcRenderer.send(channel, data);
    },
    on: (channel: any, func: any) => {
		// Strip event as it includes `sender` and is a security risk
		ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
  },
);