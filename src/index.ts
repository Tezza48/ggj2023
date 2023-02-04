#!/usr/bin/env node

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

    setDirectory(dir: Dir) {
        if (this.parent) {
            delete this.parent.items[this.name];
        }

        dir.items[this.name] = this;
        this.parent = dir;
    }

    remove() {
        delete this.parent?.items[this.name];
    }

    fullPath(): string {
        return this.parent ? this.parent.fullPath() + this.name : this.name;
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

    printName(): string {
        return escapeString(super.printName(), EscapeCodes.FgCyan);
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
    static AllAdmins: AdminEnemy[] = [];

    constructor(name: string) {
        super(name);

        AdminEnemy.AllAdmins.push(this);
    }

    printName() {
        return escapeString(this.name, EscapeCodes.FgRed, EscapeCodes.Blink);
    }

    remove() {
        super.remove();

        AdminEnemy.AllAdmins.splice(AdminEnemy.AllAdmins.indexOf(this), 1);
    }
}

// prettier-ignore
const levelRoot = 
new Dir("/", [
    new Dir("user/", [
        new Dir("tez/", [
            new Dir("code/", [
                new Dir("game_jam/")
            ]),
            new AdminEnemy("AdminTez"),
        ]),
        new Dir("history/", [
            new Dir("skyrim_mods/")
        ]),
        new Dir("admin/"),
    ]),
    new Dir("device/", [
        new Dir("gpu/", [
            new Dir("drivers/"), 
            new AdminEnemy("AdminVulkan")
        ]),
    ]),
    new Dir("programs/"),
]);

class Player {
    location!: Dir;
    readonly maxHealth = 10;
    health: number = 10;

    printHealth(): string {
        let str = "";
        for (let i = 1; i <= this.maxHealth; i++) {
            if (i < this.health) {
                str += escapeString(
                    "▓",
                    EscapeCodes.FgGreen,
                    EscapeCodes.Bright
                );
            } else if (i === this.health) {
                str += escapeString(
                    "▒",
                    EscapeCodes.FgGreen,
                    EscapeCodes.Blink
                );
            } else {
                str += escapeString("░", EscapeCodes.FgRed, EscapeCodes.Dim);
            }
        }

        return str;
    }
}

const player = new Player();
player.location = levelRoot;

const commands = {
    look: {
        desc: "Shows the current dir contents.",
        exec(otherArgs: string[]) {
            console.log(player.location.onLook(), "\n");
        },
    },
    goto: {
        desc: "[dir name] Changes to the specified directory.",
        exec(otherArgs: string[]) {
            if (otherArgs.length !== 1) {
                console.log("Too many args");
                return;
            }

            const targetName = otherArgs[0];
            const target = player.location.items[targetName];

            if (target && target instanceof Dir) {
                player.location = target;
                return;
            } else if (otherArgs[0] === "..") {
                player.location = player.location.parent ?? player.location;
            } else {
                console.log("Cannot goto", targetName);
            }
        },
    },
    attack: {
        desc: "[target name] Attack a root admin.",
        exec([enemyName]) {
            const enemy = player.location.items[enemyName];
            if (enemy && enemy instanceof AdminEnemy) {
                currentHackingGame = new HackingGame(enemy, 5, 15);
                currentState = GameState.COMBAT;
                return;
            }

            process.stdout.write("a");

            console.log(
                escapeString("No root user named: ", EscapeCodes.FgYellow),
                escapeString(enemyName, EscapeCodes.FgRed, EscapeCodes.Dim)
            );
        },
    },
    help: {
        desc: "Displays descriptions of all commands.",
        exec() {
            console.log(
                Object.entries(commands)
                    .map(([key, { desc }]) => {
                        return (
                            escapeString(key + ":") +
                            " " +
                            escapeString(
                                desc,
                                EscapeCodes.FgYellow,
                                EscapeCodes.Dim
                            )
                        );
                    })
                    .join("\n")
            );
        },
    },
} satisfies Record<string, { desc: string; exec: (args: string[]) => void }>;

enum GameState {
    TRAVERSE,
    COMBAT,
}

let currentState = GameState.TRAVERSE;

const aiMoveInterval = 3;
let traverseMoves = 0;

/**
 * Admins can move every n turns.
 * Admins can move to a parent or a random child directory
 *
 * Admins wont move if the player is in the same directory as them.
 */

const tickAdminAi = () => {
    traverseMoves++;
    if (traverseMoves % aiMoveInterval === 0) {
        for (const admin of AdminEnemy.AllAdmins) {
            if (admin.parent == player.location) {
                continue;
            }

            const moveDir = Math.random() > 0.5 ? "parent" : "child";

            const oldParent = admin.parent!;

            switch (moveDir) {
                case "child":
                    const dirsInParent = Object.values(
                        admin.parent!.items
                    ).filter((e) => e instanceof Dir) as Dir[];

                    if (dirsInParent.length > 0) {
                        const newDir =
                            dirsInParent[
                                Math.floor(Math.random() * dirsInParent.length)
                            ];
                        admin.setDirectory(newDir);
                    }
                    break;
                case "parent":
                    if (admin.parent?.parent) {
                        const newDir = admin.parent.parent;
                        admin.setDirectory(newDir);
                    }
                    break;
            }

            if (admin.parent !== oldParent) {
                console.log(
                    escapeString(
                        admin.name + " moved to " + admin.fullPath(),
                        EscapeCodes.Dim
                    )
                );
            }
        }
    }
};

const handleTraverseInput = (value: string) => {
    tickAdminAi();

    const args = value.split(" ");

    const command = commands[args[0] as keyof typeof commands];
    if (!command) {
        console.log("Unknown Command: ", args[0]);
    } else {
        command.exec(args.slice(1));
    }

    getNextInput();
};

const handleHackingInput = (value: string) => {
    const result = currentHackingGame.guess(value);

    switch (result.type) {
        case "complete":
            currentHackingGame.enemy.remove();
            console.log(
                escapeString("SUCCESS :: ", EscapeCodes.FgGreen) +
                    currentHackingGame.enemy.printName() +
                    escapeString(" Deleted", EscapeCodes.FgGreen)
            );

            // Restore 3 health by removing enemy
            player.health = Math.min(player.health + 3, player.maxHealth);

            currentState = GameState.TRAVERSE;
            getNextInput();
            return;

        case "similarity":
            console.log("Similarity: ", result.value);
            getNextInput();
            return;

        case "failed":
            console.log(escapeString("FAILURE: LockOut initiated"));

            currentState = GameState.TRAVERSE;
            getNextInput();
            return;
    }
};

let currentHackingGame: HackingGame; //= new HackingGame(new AdminEnemy("TesstEnemy"), 5, 15);

const getNextInput = () => {
    switch (currentState) {
        case GameState.TRAVERSE:
            if (AdminEnemy.AllAdmins.length === 0) {
                console.log("All root admins have been deleted, You Win.\n");

                rl.close();
                return;
            }

            // If there's enemies in this room, take 1 damage per enemy
            const damage = Object.values(player.location.items).filter(
                (item) => item instanceof AdminEnemy
            ).length;

            if (!!damage) {
                player.health -= damage;
                console.log(
                    escapeString(
                        "\tYou have taken ",
                        EscapeCodes.BgGray,
                        EscapeCodes.FgYellow
                    ) +
                        escapeString(
                            damage.toString(),
                            EscapeCodes.BgGray,
                            EscapeCodes.FgCyan
                        ) +
                        escapeString(
                            " Damage\t",
                            EscapeCodes.BgGray,
                            EscapeCodes.FgYellow
                        )
                );
            }

            if (player.health <= 0) {
                console.log("\n", "You got caught");
                rl.close();
                return;
            }

            rl.question(
                locationPrefix +
                    spacer +
                    player.printHealth() +
                    spacer +
                    escapeString(
                        player.location.fullPath() + ">",
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
                handleHackingInput
            );
            break;
    }
};

commands["help"].exec();

getNextInput();
