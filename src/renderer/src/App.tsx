import { type ReactNode, useState } from "react";
import GameScreen from "./screens/GameScreen";
import MenuScreen from "./screens/MenuScreen";
import CreateScreen from "./screens/CreateScreen";
import ConnectScreen from "./screens/ConnectScreen";
import HomeButton from "./components/HomeButton";
import type { ConnectedServer, Screen } from "./types";

export default function App() {
    const [screen, setScreen] = useState<Screen>("menu");
    const [connectedServer, setConnectedServer] = useState<ConnectedServer | null>(null);

    function joinGame(ip: string, port: number) {
        setConnectedServer({ ip, port });
        setScreen("game");
    }

    const screens: Record<Screen, ReactNode> = {
        menu: <MenuScreen setScreenFn={setScreen} />,
        create: (
            <CreateScreen
                homeButton={<HomeButton goHomeFn={() => setScreen("menu")} />}
                connectFn={joinGame}
            />
        ),
        connect: (
            <ConnectScreen
                homeButton={<HomeButton goHomeFn={() => setScreen("menu")} />}
                connectFn={joinGame}
            />
        ),
        game: <GameScreen connectedServer={connectedServer} goHomeFn={() => setScreen("menu")} />
    };

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            {screens[screen]}
        </div>
    );
}
