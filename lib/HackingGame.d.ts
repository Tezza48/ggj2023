import { AdminEnemy } from ".";
export declare class HackingGame {
    words: string[];
    correctWord: string;
    enemy: AdminEnemy;
    readonly maxAttempts = 4;
    attempts: number;
    impossibleGuesses: string[];
    guesses: string[];
    constructor(enemy: AdminEnemy);
    guess(word: string): {
        readonly type: "complete";
        readonly value?: undefined;
    } | {
        readonly type: "failed";
        readonly value?: undefined;
    } | {
        readonly type: "similarity";
        readonly value: number;
    };
    printBoard(): void;
}
