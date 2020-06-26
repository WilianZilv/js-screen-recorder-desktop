const path = require("path");
const { app, BrowserWindow, screen } = require("electron");
const { Fragment } = require("react");

const isDev = process.isDev;

let mainWindow;
let frame;
async function createWindow() {
    if (isDev) {
        try {
            const {
                default: installExtension,
                REACT_DEVELOPER_TOOLS,
            } = require("electron-devtools-installer");
            await installExtension(REACT_DEVELOPER_TOOLS, true);
        } catch (error) {}
    }
    const width = 250;
    const height = 150;
    const toolbarOffset = 40;
    const margin = 8;
    const bounds = screen.getPrimaryDisplay().bounds;

    mainWindow = new BrowserWindow({
        x: bounds.width - width - margin,
        y: bounds.height - height - toolbarOffset - margin,
        width,
        height,
        resizable: false,
        show: false,
        icon: path.join(process.resourcesPath, "media", "icon.ico"),
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.removeMenu();
    mainWindow.on("ready-to-show", async () => {
        mainWindow.show();
        if (isDev) {
            const devtools = new BrowserWindow({
                title: "Developer Tools",
            });
            devtools.setBounds({
                x: 1920,
            });
            devtools.moveTop();

            mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
            mainWindow.webContents.openDevTools({ mode: "detach" });
        }
    });
    mainWindow.on("closed", () => (mainWindow = null));
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );

    frame = new BrowserWindow({
        title: "frame",
        transparent: true,
        frame: false,
    });

    frame.loadFile(path.join(__dirname, "frame.html"));
}

app.on("ready", createWindow);

app.on("activate", () => {
    if (mainWindow === null) createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

module.exports = {
    getFrame: () => frame,
    getWindow: () => mainWindow,
};
