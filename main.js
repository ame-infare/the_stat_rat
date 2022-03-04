const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const newWindow = new BrowserWindow({
        show: false,
        width: 1920,
        height: 1080,
        //icon: __dirname + '/build-res/statRat.ico',

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
