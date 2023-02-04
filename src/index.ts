#!/usr/bin/env node

import { create } from "domain";
import { readFile, readFileSync } from "fs";
import { openStdin, stdin } from "process";
import * as readline from "readline";

const wordList = readFileSync("./src/wordlist.txt", "utf-8");

const wordMap = wordList.split("\r\n").reduce((map, current) => {
    if (!map[current.length]) map[current.length] = [];

    map[current.length].push(current);

    return map;
}, {} as Record<number, string[]>);

class HackingGame {
    words: string[];

    attempts: number;

    constructor(wordLength: number, numWords: number) {
        const all = wordMap[wordLength];
        this.words = [];

        this.attempts = 3;

        for (let i = 0; i < numWords; i++) {
            const index = Math.floor(Math.random() * all.length);
            this.words.push(all[index]);
        }
    }

    guess(word: string) {
        if (this.words.indexOf(word)) {
            return { type: "complete" } as const;
        }

        this.attempts--;

        let similarity = 0;

        for (let charIndex = 0; charIndex < word.length; charIndex++) {
            let match = false;

            for (
                let wordIndex = 0;
                wordIndex < this.words.length;
                wordIndex++
            ) {
                if (this.words[wordIndex][charIndex] === word[charIndex])
                    match = true;
            }

            if (match) similarity++;
        }

        return { type: "similarity", value: similarity } as const;
    }

    printBoard() {
        console.log(this.words.join("\n"));
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let locationPrefix = "r00tu53r :: ";

class Item {
    name: string;
    parent?: Dir;

    constructor(name: string) {
        this.name = name;
    }

    printName() {
        return this.name;
    }
}

class Dir extends Item {
    parent?: Dir;
    items: Record<string, Item>;

    constructor(name: string, items?: Item[]) {
        super(name);

        this.items = Object.fromEntries((items ?? []).map((e) => [e.name, e]));

        if (items) {
            for (const item of items) item.parent = this;
        }
    }

    fullPath(): string {
        return this.parent ? this.parent.fullPath() + this.name : this.name;
    }

    onLook(): string {
        if (Object.values(this.items).length === 0) {
            return "There is nothing in this directory";
        }

        return Object.values(this.items)
            .map((i) => "\t" + i.printName())
            .join("\n");
    }
}

class AdminEnemy extends Item {
    printName() {
        return "\x1b[31m" + this.name + "\x1b[0m";
    }
}

const levelRoot = new Dir("/", [new Dir("user/"), new AdminEnemy("AdminTez")]);

let currentLocation = levelRoot;

const commands = {
    look: {
        desc: "Shows the current dir contents",
        exec(otherArgs: string[]) {
            console.log(currentLocation.onLook());
        },
    },
    goto: {
        desc: "Changes to the specified directory",
        exec(otherArgs: string[]) {
            if (otherArgs.length !== 1) {
                console.log("Too many args");
                return;
            }

            const targetName = otherArgs[0];
            const target = currentLocation.items[targetName];

            if (target && target instanceof Dir) {
                currentLocation = target;
                return;
            } else if (otherArgs[0] === "..") {
                currentLocation = currentLocation.parent ?? currentLocation;
            } else {
                console.log("Cannot goto", targetName);
            }
        },
    },
    attack: {
        desc: "Attack the admins in this directory",
        exec(_) {
            console.clear();
            currentState = GameState.COMBAT;
        },
    },
} as Record<string, { desc: string; exec: (args: string[]) => void }>;

enum GameState {
    TRAVERSE,
    COMBAT,
}

let currentState = GameState.COMBAT;

const handleTraverseInput = (value: string) => {
    const args = value.split(" ");

    const command = commands[args[0]];
    if (!command) {
        console.log("Unknown Command: ", args[0]);
    } else {
        command.exec(args.slice(1));
    }

    getNextInput();
};

let currentHackingGame = new HackingGame(5, 5);

const getNextInput = () => {
    switch (currentState) {
        case GameState.TRAVERSE:
            rl.question(
                locationPrefix + currentLocation.fullPath() + ">",
                handleTraverseInput
            );
            break;
        case GameState.COMBAT:
            currentHackingGame.printBoard();

            rl.question(
                "Hacking :: " + currentHackingGame.attempts + "Attepmpts :: >",
                (value: string) => {
                    const result = currentHackingGame.guess(value);

                    switch (result.type) {
                        case 
                    }
                }
            );
            break;
    }
};

getNextInput();
