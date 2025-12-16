import type { Screen } from "../types";

type Props = {
    setScreenFn: (screenName: Screen) => void;
};

export default function MenuScreen({ setScreenFn }: Readonly<Props>) {
    return (
        <>
            <h1 className="text-3xl text-center">Крестики нолики по сети</h1>
            <div className="grid sm:grid-cols-2 gap-2">
                <button
                    className="bg-surface text-lg hover:brightness-95 active:brightness-105 transition-all border border-border p-4 rounded-sm shadow-sm cursor-pointer"
                    onClick={() => setScreenFn("create")}
                >
                    Создать игру
                </button>

                <button
                    className="bg-surface text-lg hover:brightness-95 active:brightness-105 transition-all border border-border p-4 rounded-sm shadow-sm cursor-pointer"
                    onClick={() => setScreenFn("connect")}
                >
                    Присоединиться к игре
                </button>
            </div>
            <p className="fixed left-1 bottom-1 max-w-2/3 text-gray-500">
                Результат индивидуального проекта &quot;Разработка кроссплатформенного десктопного
                приложения с организацией прямого сетевого взаимодействия на основе
                веб-технологий&quot;. ИнтернетУрок, 10 класс.
            </p>
        </>
    );
}
