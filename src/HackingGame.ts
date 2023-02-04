import { AdminEnemy } from ".";

import wordMap from "./wordMap.json";

export class HackingGame {
    words: string[];

    correctWord: string;

    enemy: AdminEnemy;

    attempts: number;

    constructor(enemy: AdminEnemy, wordLength: number, numWords: number) {
        this.enemy = enemy;

        const all = (wordMap as Record<string, string[]>)[
            wordLength.toString()
        ];
        this.words = [];

        this.attempts = 3;

        for (let i = 0; i < numWords; i++) {
            const index = Math.floor(Math.random() * all.length);
            this.words.push(all[index]);
        }

        this.correctWord = this.words[Math.floor(Math.random() * numWords)];
    }

    guess(word: string) {
        if (this.words.indexOf(word)) {
            return { type: "complete" } as const;
        }

        this.attempts--;

        let similarity = 0;

        for (let charIndex = 0; charIndex < word.length; charIndex++) {
            let match = false;

            if (this.correctWord[charIndex] === word[charIndex]) similarity++;
        }

        return { type: "similarity", value: similarity } as const;
    }

    printBoard() {
        console.log("Hacking: " + this.enemy.printName());
        console.log(this.words.join("\n"));
    }
}
