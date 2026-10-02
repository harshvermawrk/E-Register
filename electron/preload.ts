import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("app:get-version"),
});
