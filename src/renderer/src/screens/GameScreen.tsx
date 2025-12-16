import { emptyGameField } from "@shared/constants";
import type { ClientMessage, GameField, NonEmptyGameCell, ServerMessage } from "@shared/types";
import type { ConnectedServer } from "@renderer/types";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";

type Props = {
    connectedServer: ConnectedServer | null;
    goHomeFn: () => void;
};

export default function GameScreen({ connectedServer, goHomeFn }: Readonly<Props>) {
    const [gameField, setGameField] = useState<GameField>(emptyGameField);
    const [turn, setTurn] = useState<NonEmptyGameCell>("cross");
    const [playerCount, setPlayerCount] = useState(0);

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<ServerMessage>(
        `ws://${connectedServer?.ip}:${connectedServer?.port}`,
        {
            onOpen: () => toast.success("Успешно подключено к игре!"),
            onClose: () => {
                goHomeFn();
            },
            onError: () => toast.error("Ошибка WebSocket соединения"),
            shouldReconnect: () => false
        }
    );

    useEffect(() => {
        if (lastJsonMessage) {
            switch (lastJsonMessage.type) {
                case "state":
                    setGameField(lastJsonMessage.board);
                    setTurn(lastJsonMessage.turn);
                    break;
                case "player-count-update":
                    setPlayerCount(lastJsonMessage.count);
                    toast.info("Новый игрок подключился");
                    break;
                case "game-end":
                    toast.info(lastJsonMessage.message);
                    goHomeFn();
                    break;
                case "error":
                    toast.error(lastJsonMessage.message);
                    break;

                default:
                    break;
            }
        }
    }, [lastJsonMessage, goHomeFn]);

    function handlePlaceShape(index: number) {
        if (readyState === ReadyState.OPEN) {
            const message: ClientMessage = { type: "move", index };
            sendJsonMessage(message);
        } else {
            toast.warning("Невозможно сделать ход, нет подключения к серверу.");
        }
    }

    if (!connectedServer) {
        return <p>Вы не подключены к серверу</p>;
    }

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Подключение...",
        [ReadyState.OPEN]: `Игра идет. Ход ${turn === "cross" ? "крестиков" : "ноликов"}`,
        [ReadyState.CLOSING]: "Закрытие соединения...",
        [ReadyState.CLOSED]: "Соединение закрыто",
        [ReadyState.UNINSTANTIATED]: "Не инициализировано"
    }[readyState];

    return (
        <>
            <div className="absolute top-4 left-4 text-lg font-semibold bg-surface border border-border p-2 rounded-sm shadow-md">
                Игроки: {playerCount} / 2
            </div>
            <div className="absolute top-4 right-4 text-lg font-semibold bg-surface border border-border p-2 rounded-sm shadow-md">
                IP: {connectedServer.ip}
                <br /> port: {connectedServer.port}
            </div>
            <p className="mb-4 text-lg">{connectionStatus}</p>
            <div className="grid grid-cols-3 w-[300px] aspect-square border border-border rounded-sm bg-surface shadow-sm">
                {gameField.map((cell, index) => (
                    <button
                        onClick={() => handlePlaceShape(index)}
                        key={index}
                        className={clsx(
                            "border border-border aspect-square flex justify-center items-center",
                            !cell && "cursor-pointer"
                        )}
                    >
                        {cell && <div className={cell}></div>}
                    </button>
                ))}
            </div>
        </>
    );
}
