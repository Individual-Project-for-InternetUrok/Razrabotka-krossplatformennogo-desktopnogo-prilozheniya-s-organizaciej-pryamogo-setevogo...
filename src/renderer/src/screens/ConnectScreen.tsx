import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    homeButton: ReactNode;
    connectFn: (ip: string, port: number) => void;
};

export default function ConnectScreen({ homeButton, connectFn }: Readonly<Props>) {
    const [ip, setIp] = useState<string>("");
    const [userIp, setUserIp] = useState<string>("Получение IP...");
    const [port, setPort] = useState<number>(8080);

    useEffect(() => {
        (async () => {
            setUserIp(await window.api.getLocalIp());
        })();
    }, []);

    function handleJoinGame() {
        if (isNaN(port)) {
            toast.error("Порт должен быть числом");
            return;
        }

        if (port < 1024 || port > 49151) {
            toast.error("Порт должен быть больше 1024 и меньше 49151");
            return;
        }

        if (ip === userIp) {
            toast.error("Вы не можете подключиться по своему IP");
            return;
        }

        connectFn(ip, port);
    }

    return (
        <>
            {homeButton}
            <h2 className="text-2xl font-semibold text-center">Присоединиться к игре</h2>
            <label htmlFor="ip">IP</label>
            <input
                id="ip"
                placeholder="IP для подключения"
                type="text"
                required
                value={ip}
                onChange={(event) => setIp(event.target.value)}
                className="border border-border min-w-[175px] user-invalid:border-red-300 rounded-sm p-1"
            ></input>
            <label htmlFor="port">Порт</label>
            <input
                id="port"
                placeholder="Порт для подключения"
                type="number"
                min={1024}
                max={49151}
                required
                value={port}
                onChange={(event) => setPort(event.target.valueAsNumber)}
                className="border border-border min-w-[175px] user-invalid:border-red-300 rounded-sm p-1"
            ></input>
            <button
                className="bg-surface hover:brightness-95 active:brightness-105 transition-all border border-border p-2 rounded-sm shadow-sm cursor-pointer"
                onClick={handleJoinGame}
            >
                Присоединиться к игре
            </button>
        </>
    );
}
