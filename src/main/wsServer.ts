import http from "http";
import { WebSocketServer, type RawData, type WebSocket } from "ws";
import type { GameField, NonEmptyGameCell, ServerMessage } from "../shared/types";
import { emptyGameField } from "../shared/constants";
import { winningCombos } from "./constants";
import { isValidClientMessage } from "./utils";

type WsServerOptions = {
    port: number;
};

export function startWsServer({ port }: WsServerOptions) {
    let turn: NonEmptyGameCell = "cross";
    const board: GameField = [...emptyGameField];

    const server = http.createServer();
    const wsServer = new WebSocketServer({ server });
    const connections: Record<NonEmptyGameCell, WebSocket | null> = {
        cross: null,
        circle: null
    };

    function checkForWin() {
        let gameHasEnded = false;

        for (const array of winningCombos) {
            const circleWins = array.every((cell) => board[cell] === "circle");
            if (circleWins) {
                broadcast({ type: "game-end", message: "Нолики победили" });
                gameHasEnded = true;
                return gameHasEnded;
            }

            const crossWins = array.every((cell) => board[cell] === "cross");
            if (crossWins) {
                broadcast({ type: "game-end", message: "Крестики победили" });
                gameHasEnded = true;
                return gameHasEnded;
            }
        }

        if (board.every((cell) => cell !== null)) {
            broadcast({ type: "game-end", message: "Ничья" });
            gameHasEnded = true;
        }

        return gameHasEnded;
    }

    function handleMove(connection: WebSocket, shape: NonEmptyGameCell, targetIndex: number) {
        if (shape !== turn) {
            sendMessage(connection, { type: "error", message: "Сейчас не ваш ход" });
            return;
        }

        if (board[targetIndex]) {
            sendMessage(connection, { type: "error", message: "Клетка занята" });
            return;
        }

        board[targetIndex] = shape;

        turn = shape === "cross" ? "circle" : "cross";

        const gameEnded = checkForWin();

        if (!gameEnded) {
            broadcast({ type: "state", board, turn });
        } else {
            server.close();
            return;
        }
    }

    function sendMessage(connection: WebSocket, message: ServerMessage) {
        connection.send(JSON.stringify(message));
    }

    function broadcastPlayerCount() {
        let count = 0;
        if (connections.cross) count++;
        if (connections.circle) count++;

        broadcast({ type: "player-count-update", count });
    }

    function broadcast(message: ServerMessage) {
        const msg = JSON.stringify(message);
        connections.cross?.send(msg);
        connections.circle?.send(msg);
    }

    function handleClose(shape: NonEmptyGameCell) {
        connections[shape] = null;

        broadcastPlayerCount();

        const otherPlayerShape = shape === "cross" ? "circle" : "cross";
        const otherPlayerConnection = connections[otherPlayerShape];

        if (otherPlayerConnection) {
            const infoMessage: ServerMessage = {
                type: "game-end",
                message: `Игрок за ${shape === "circle" ? "Нолики" : "Крестики"} отключился. Игра окончена.`
            };
            sendMessage(otherPlayerConnection, infoMessage);
        }

        server.close();
    }

    function handleMessage(
        connection: WebSocket,
        messageBytes: RawData,
        userShape: NonEmptyGameCell
    ) {
        let jsonMessage: Record<string, unknown>;

        const cantProcessMessage: ServerMessage = {
            type: "error",
            message: "Не удалось обработать ваше действие"
        };

        const rawStringMessage = messageBytes.toString();
        console.log(`Получена строка от клиента ${userShape}:`, rawStringMessage);

        try {
            jsonMessage = JSON.parse(rawStringMessage);
        } catch {
            console.error("Ошибка парсинга JSON");
            sendMessage(connection, cantProcessMessage);
            return;
        }

        if (!isValidClientMessage(jsonMessage)) {
            console.error(`Сообщение невалидное: ${jsonMessage}`);
            sendMessage(connection, cantProcessMessage);
            return;
        }

        handleMove(connection, userShape, jsonMessage.index);
    }

    wsServer.on("connection", (connection) => {
        if (connections.cross && connections.circle) {
            sendMessage(connection, { type: "error", message: "Игра уже началась" });
            return;
        }

        let userShape: NonEmptyGameCell;

        if (!connections.cross) {
            connections.cross = connection;
            userShape = "cross";
        } else {
            connections.circle = connection;
            userShape = "circle";
        }

        sendMessage(connection, { type: "state", board, turn });

        broadcastPlayerCount();

        connection.on("message", (message) => handleMessage(connection, message, userShape));
        connection.on("close", () => handleClose(userShape));
    });

    server.listen(port, "0.0.0.0", () => {
        console.log(`WebSocket сервер запущен на порту ${port}`);
    });

    return { closeFn: () => server.close() };
}
