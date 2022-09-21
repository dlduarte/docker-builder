const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld(
    'ipcRenderer', {
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, (event, ...args) => listener(...args)),
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
    });