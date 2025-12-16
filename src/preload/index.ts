import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
    on: (channel: string, callback: (...args: unknown[]) => void) => {
        ipcRenderer.on(channel, (_, ...args) => callback(...args));
    },
    removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
        ipcRenderer.removeListener(channel, callback);
    },

    getLocalIp: (): Promise<string> => {
        return ipcRenderer.invoke("get-local-ip");
    },
    createGame: (port: number): Promise<{ success: boolean }> => {
        return ipcRenderer.invoke("create-game", port);
    }
};

export type Api = typeof api;

try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
