const TabGroup = require("electron-tabs");

let tabGroup = new TabGroup();
let statsTab = tabGroup.addTab({
    title: "STATS",
    src: "./stats.html",
    visible: true,
    active: true,

    webviewAttributes: {
        nodeIntegration: true
    }
});

const webview = document.querySelector('webview');
webview.addEventListener('console-message', (e) => {
  console.log('Guest page logged a message:', e.message);
});
