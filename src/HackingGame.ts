import { AdminEnemy, EscapeCodes, escapeString } from ".";

// List of words from https://www.mit.edu/~ecprice/wordlist.10000
import wordMap from "./wordMap.json";

export class HackingGame {
    words: string[];

    correctWord: string;

    enemy: AdminEnemy;

    readonly maxAttempts = 4;
    attempts: number;

    impossibleGuesses: string[] = [];
    guesses: string[] = [];

    constructor(enemy: AdminEnemy) {
        this.enemy = enemy;

        const numWords = Math.max(10, 2 + enemy.dificulty * 2);

        const all = (wordMap as Record<string, string[]>)[
            enemy.dificulty.toString()
        ];
        this.words = [];

        this.attempts = this.maxAttempts;

        for (let i = 0; i < numWords; i++) {
            const index = Math.floor(Math.random() * all.length);
            this.words.push(all[index]);
        }

        this.correctWord = this.words[Math.floor(Math.random() * numWords)];
    }

    guess(word: string) {
        this.guesses.push(word);

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

        if (similarity === 0) {
            this.impossibleGuesses.push(word);
        }

        return { type: "similarity", value: similarity } as const;
    }

    printBoard() {
        const printRows = 3;
        console.log("\n\n\tHacking :: " + this.enemy.printName() + "\n");

        if (this.attempts === this.maxAttempts) {
            console.log(
                escapeString(
                    "Similarity indicates how many letters in your guess are:\n\t1) In the correct word\n\t2) In the correct position\n(Similar to getting green letters in a certain popular daily puzzle.\n",
                    EscapeCodes.Dim
                )
            );
        }

        console.log(
            this.words
                .map((word) => {
                    // are there matching letters with an impossible word
                    let matchesAny = false;

                    for (const impossible of this.impossibleGuesses) {
                        for (let i = 0; i < impossible.length; i++) {
                            const containsChar = word[i] === impossible[i];

                            if (containsChar) {
                                matchesAny = true;
                                break;
                            }
                        }

                        if (matchesAny) {
                            break;
                        }
                    }

                    if (
                        this.guesses.indexOf(word) != -1 &&
                        this.impossibleGuesses.indexOf(word) === -1
                    ) {
                        return escapeString(
                            word,
                            EscapeCodes.FgYellow,
                            EscapeCodes.Dim
                        );
                    }

                    if (matchesAny) {
                        return escapeString(
                            word,
                            EscapeCodes.FgRed,
                            EscapeCodes.Dim
                        );
                    }

                    if (this.guesses.indexOf(word) != -1) {
                        return escapeString(
                            word,
                            EscapeCodes.FgYellow,
                            EscapeCodes.Dim
                        );
                    }

                    return word;
                })
                .reduce((pairs, current, i, arr) => {
                    if (i % printRows === 0) {
                        pairs.push(
                            "\t" + arr.slice(i, i + printRows).join(" | ")
                        );
                    }

                    return pairs;
                }, [] as string[])
                .join("\n") + "\n"
        );
    }
}
