const { app, BrowserWindow, BrowserView } = require('electron');

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
  
    newWindow.loadFile('src/stats.html');
    // const view = new BrowserView();
    // newWindow.setBrowserView(view);
    // view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
    // view.webContents.loadFile('src/stats.html');

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
