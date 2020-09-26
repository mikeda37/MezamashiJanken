const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld(
    'ipcRendererApi', {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);            
        },
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
    },
);

const moment = require('moment');
contextBridge.exposeInMainWorld(
    'momentApi', {
        day: () => {
            moment().day();
        },
    }
);
