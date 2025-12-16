type Props = {
    goHomeFn: () => void;
};

export default function HomeButton({ goHomeFn }: Readonly<Props>) {
    return (
        <button
            onClick={goHomeFn}
            className="bg-surface hover:brightness-95 active:brightness-105 transition-all border border-border p-1 rounded-full shadow-sm cursor-pointer fixed top-2.5 left-2.5"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="var(--color-fg)"
            >
                <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
            </svg>
        </button>
    );
}
