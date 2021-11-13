const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const newWindow = new BrowserWindow({
        show: false,
        width: 1920,
        height: 1080,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });
  
    newWindow.loadFile('src/index.html');

    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    newWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})
