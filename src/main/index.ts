import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { getLocalIPAddress } from "./utils";
import { startWsServer } from "./wsServer";

let closeCurrentServer: (() => void) | null = null;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false
        }
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.electron");

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    ipcMain.handle("get-local-ip", (event) => {
        const ip = getLocalIPAddress();

        if (!ip) {
            const errorMessage = "Не удалось получить IP";
            event.sender.send("error", errorMessage);
            return errorMessage;
        }

        return ip;
    });

    ipcMain.handle("create-game", (event, port): { success: boolean } => {
        if (closeCurrentServer) {
            closeCurrentServer();
        }

        try {
            const { closeFn } = startWsServer({ port });
            closeCurrentServer = closeFn;
            return { success: true };
        } catch (error) {
            console.error("Не удалось запустить сервер:", error);
            event.sender.send(
                "error",
                error instanceof Error ? error.message : "Неизвестная ошибка вебсокет сервера"
            );
            return { success: false };
        }
    });

    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
