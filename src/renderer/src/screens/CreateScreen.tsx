import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    homeButton: ReactNode;
    connectFn: (ip: string, port: number) => void;
};

export default function CreateScreen({ homeButton, connectFn }: Readonly<Props>) {
    const [ip, setIp] = useState<string>("Получение IP...");
    const [port, setPort] = useState<number>(8080);

    useEffect(() => {
        (async () => {
            setIp(await window.api.getLocalIp());
        })();
    }, []);

    async function handleCreateGame() {
        if (isNaN(port)) {
            toast.error("Порт должен быть числом");
            return;
        }

        if (port < 1024 || port > 49151) {
            toast.error("Порт должен быть больше 1024 и меньше 49151");
            return;
        }

        const result = await window.api.createGame(port);

        if (result) {
            connectFn(ip, port);
        }
    }

    return (
        <>
            {homeButton}
            <h2 className="text-2xl font-semibold text-center">Создать игру</h2>
            <p>Ваш IP: {ip}</p>
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
            <p>Во избежание конфликтов порт должен быть в промежутке от 1024 до 49151</p>
            <button
                className="bg-surface hover:brightness-95 active:brightness-105 transition-all border border-border p-2 rounded-sm shadow-sm cursor-pointer"
                onClick={handleCreateGame}
            >
                Создать игру
            </button>
        </>
    );
}
