#!/usr/bin/env node

import { create } from "domain";
import { readFile, readFileSync } from "fs";
import { openStdin, stdin } from "process";
import * as readline from "readline";
import { HackingGame } from "./HackingGame";

console.clear();

export enum EscapeCodes {
    Reset = "0",
    Bright = "1",
    Dim = "2",
    Underscore = "4",
    Blink = "5",
    Reverse = "7",
    Hidden = "8",

    FgBlack = "30",
    FgRed = "31",
    FgGreen = "32",
    FgYellow = "33",
    FgBlue = "34",
    FgMagenta = "35",
    FgCyan = "36",
    FgWhite = "37",
    FgGray = "90",

    BgBlack = "40",
    BgRed = "41",
    BgGreen = "42",
    BgYellow = "43",
    BgBlue = "44",
    BgMagenta = "45",
    BgCyan = "46",
    BgWhite = "47",
    BgGray = "100",
}

export function escapeString(value: string, ...escapes: EscapeCodes[]) {
    return `\x1b[${(escapes ?? [EscapeCodes.Reset]).join(";")}m${value}\x1b[${
        EscapeCodes.Reset
    }m`;
}

export const wordList = readFileSync("./src/wordlist.txt", "utf-8");

export const wordMap = wordList.split("\r\n").reduce((map, current) => {
    if (!map[current.length]) map[current.length] = [];

    map[current.length].push(current);

    return map;
}, {} as Record<number, string[]>);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let locationPrefix = escapeString(
    "r00tu53r",
    EscapeCodes.FgYellow,
    EscapeCodes.Dim
);
const spacer = escapeString(" :: ", EscapeCodes.FgCyan, EscapeCodes.Dim);

export class Item {
    name: string;
    parent?: Dir;

    constructor(name: string) {
        this.name = name;
    }

    printName() {
        return this.name;
    }

    remove() {
        delete this.parent?.items[this.name];
    }
}

export class Dir extends Item {
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

export class AdminEnemy extends Item {
    static NumEnemies = 0;

    constructor(name: string) {
        super(name);

        AdminEnemy.NumEnemies++;
    }

    printName() {
        return escapeString(this.name, EscapeCodes.FgRed, EscapeCodes.Blink); //"\x1b[31m" + this.name + "\x1b[0m";
    }

    remove() {
        super.remove();

        AdminEnemy.NumEnemies--;
    }
}

const levelRoot = new Dir("/", [new Dir("user/"), new AdminEnemy("AdminTez")]);

let currentLocation = levelRoot;

const maxHealth = 10;
let health = 10;

function printHealth() {
    let str = "";
    for (let i = 1; i <= maxHealth; i++) {
        if (i < health) {
            str += escapeString("▓", EscapeCodes.FgGreen, EscapeCodes.Bright);
        } else if (i === health) {
            str += escapeString("▒", EscapeCodes.FgGreen, EscapeCodes.Blink);
        } else {
            str += escapeString("░", EscapeCodes.FgRed, EscapeCodes.Dim);
        }
    }

    return str;
}

const commands = {
    look: {
        desc: "Shows the current dir contents",
        exec(otherArgs: string[]) {
            console.log(currentLocation.onLook(), "\n");
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
        exec([enemyName]) {
            const enemy = currentLocation.items[enemyName];
            if (enemy && enemy instanceof AdminEnemy) {
                currentHackingGame = new HackingGame(enemy, 5, 15);
                currentState = GameState.COMBAT;
                return;
            }

            console.log(
                escapeString("No root user named: ", EscapeCodes.FgYellow),
                escapeString(enemyName, EscapeCodes.FgRed, EscapeCodes.Dim)
            );
        },
    },
} as Record<string, { desc: string; exec: (args: string[]) => void }>;

enum GameState {
    TRAVERSE,
    COMBAT,
}

let currentState = GameState.TRAVERSE;

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

let currentHackingGame: HackingGame; //= new HackingGame(new AdminEnemy("TesstEnemy"), 5, 15);

const getNextInput = () => {
    switch (currentState) {
        case GameState.TRAVERSE:
            if (AdminEnemy.NumEnemies === 0) {
                console.log("All root admins have been deleted, You Win.\n");

                rl.close();
                return;
            }

            // If there's enemies in this room, take 1 damage per enemy
            const damage = Object.values(currentLocation.items).filter(
                (item) => item instanceof AdminEnemy
            ).length;

            if (!!damage) {
                health -= damage;
                console.log(
                    escapeString(
                        "\tYou have taken ",
                        EscapeCodes.BgCyan,
                        EscapeCodes.FgYellow
                    ) +
                        escapeString(
                            damage.toString(),
                            EscapeCodes.BgCyan,
                            EscapeCodes.FgYellow,
                            EscapeCodes.Dim
                        ) +
                        escapeString(
                            " Damage\t",
                            EscapeCodes.BgCyan,
                            EscapeCodes.FgYellow
                        )
                );
            }

            if (health <= 0) {
                console.log("\n", "You got caught");
                rl.close();
                return;
            }

            rl.question(
                locationPrefix +
                    spacer +
                    printHealth() +
                    spacer +
                    escapeString(
                        currentLocation.fullPath() + ">",
                        EscapeCodes.FgYellow,
                        EscapeCodes.Dim
                    ),
                handleTraverseInput
            );
            break;
        case GameState.COMBAT:
            currentHackingGame.printBoard();

            rl.question(
                "Hacking" +
                    spacer +
                    escapeString(
                        currentHackingGame.attempts.toString(),
                        EscapeCodes.Underscore,
                        EscapeCodes.FgCyan
                    ) +
                    " Attepmpts" +
                    spacer +
                    " >",
                (value: string) => {
                    const result = currentHackingGame.guess(value);

                    switch (result.type) {
                        case "complete":
                            currentHackingGame.enemy.remove();
                            console.log(
                                escapeString(
                                    "SUCCESS, " +
                                        currentHackingGame.enemy.printName() +
                                        " Deleted",
                                    EscapeCodes.FgGreen
                                )
                            );

                            // Restore 3 health by removing enemy
                            health = Math.min(health + 3, maxHealth);

                            currentState = GameState.TRAVERSE;
                            getNextInput();
                            return;

                        case "similarity":
                            console.log("Similarity: ", result.value);
                            getNextInput();
                            return;
                    }
                }
            );
            break;
    }
};

console.log(
    Object.entries(commands)
        .map(([key, { desc }]) => {
            return (
                escapeString(key + ":") +
                " " +
                escapeString(desc, EscapeCodes.FgYellow, EscapeCodes.Dim)
            );
        })
        .join("\n")
);

getNextInput();
