import { AdminEnemy, EscapeCodes, escapeString } from ".";

// List of words from https://www.mit.edu/~ecprice/wordlist.10000
import wordMap from "./wordMap.json";

export class HackingGame {
    words: string[];

    correctWord: string;

    enemy: AdminEnemy;

    attempts: number;

    constructor(enemy: AdminEnemy) {
        this.enemy = enemy;

        const numWords = 15;

        const all = (wordMap as Record<string, string[]>)[
            enemy.dificulty.toString()
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
        if (word == this.correctWord) {
            return { type: "complete" } as const;
        }

        this.attempts--;

        if (this.attempts <= 0) {
            return { type: "failed" } as const;
        }

        let similarity = 0;

        for (let charIndex = 0; charIndex < word.length; charIndex++) {
            if (this.correctWord[charIndex] === word[charIndex]) similarity++;
        }

        return { type: "similarity", value: similarity } as const;
    }

    printBoard() {
        console.log("\n\n\tHacking :: " + this.enemy.printName());
        console.log(
            escapeString(
                "Similarity indicates how many letters in your guess are:\n\t1) In the correct word\n\t2) In the correct position\n(Similar to getting green letters in a certain popular daily puzzle",
                EscapeCodes.Dim
            )
        );
        console.log(this.words.join("\n"));
    }
}
