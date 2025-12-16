export type GameCell = "circle" | "cross" | null;

export type NonEmptyGameCell = NonNullable<GameCell>;

export type GameField = [
    GameCell,
    GameCell,
    GameCell,
    GameCell,
    GameCell,
    GameCell,
    GameCell,
    GameCell,
    GameCell
];

export type ServerMessage =
    | { type: "error"; message: string }
    | { type: "game-end"; message: string }
    | { type: "state"; board: GameField; turn: NonEmptyGameCell }
    | { type: "player-count-update"; count: number };

export type ClientMessage = { type: "move"; index: number };
