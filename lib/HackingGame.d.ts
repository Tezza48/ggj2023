import { AdminEnemy } from ".";
export declare class HackingGame {
    words: string[];
    correctWord: string;
    enemy: AdminEnemy;
    attempts: number;
    constructor(enemy: AdminEnemy, wordLength: number, numWords: number);
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
