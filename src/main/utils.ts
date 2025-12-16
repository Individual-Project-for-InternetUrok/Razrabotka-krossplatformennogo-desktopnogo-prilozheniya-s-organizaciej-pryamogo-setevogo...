import os from "os";
import { ClientMessage } from "../shared/types";

export function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();

    for (const devName in interfaces) {
        const iface = interfaces[devName];

        if (!iface) {
            return null;
        }

        for (const alias of iface) {
            if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
                return alias.address;
            }
        }
    }
    return null;
}

export function isValidClientMessage(obj: unknown): obj is ClientMessage {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        "index" in obj &&
        obj.type === "move" &&
        typeof obj.index === "number"
    );
}
