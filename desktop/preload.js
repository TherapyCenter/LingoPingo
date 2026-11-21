// Tells the web app that it runs inside the Windows app.
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('LingoDesktop', { platform: process.platform });
