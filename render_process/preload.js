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
            return moment().day();
        },
        lastWeekDate: (dateStr) => {
            return moment(dateStr).add(-7, 'day').format('YYYYMMDD').toString();
        },
    },
);
