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

const printMessage = (message: string) => {
    console.log(
        escapeString("m3ss4ge", EscapeCodes.FgGray, EscapeCodes.Blink) +
            spacer +
            escapeString(message, EscapeCodes.FgGray, EscapeCodes.Blink)
    );
};

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

    /**
     * Removes an item from the filesystem.
     */
    remove() {
        delete this.parent?.items[this.name];
    }

    fullPath(): string {
        return this.parent ? this.parent.fullPath() + this.name : this.name;
    }
}

class TextFile extends Item {
    text: string = "There is nothing of interest in this file.";
    public constructor(name: `${string}.txt`, text?: string) {
        super(name);

        if (text) this.text = text;
    }

    onRead(): string {
        return this.text;
    }
}

export class Dir extends Item {
    visited: boolean;
    parent?: Dir;
    items: Record<string, Item>;

    constructor(name: `${string}/`, items?: Item[]) {
        super(name);

        this.visited = false;

        this.items = Object.fromEntries((items ?? []).map((e) => [e.name, e]));

        if (items) {
            for (const item of items) item.parent = this;
        }
    }

    printName(): string {
        return escapeString(
            super.printName(),
            ...(this.visited
                ? [EscapeCodes.FgCyan, EscapeCodes.Dim]
                : [EscapeCodes.FgCyan])
        );
    }

    onLook(): string {
        let ret = "";
        if (Object.values(this.items).length > 0) {
            ret += Object.values(this.items)
                .map((i) => "\t" + i.printName() + "\n")
                .join("");
        }

        if (this.parent)
            ret += escapeString("\t../", EscapeCodes.FgCyan, EscapeCodes.Dim);

        return ret;
    }
}

export class AdminEnemy extends Item {
    static AllAdmins: AdminEnemy[] = [];
    dificulty: number;

    moveInterval: number;

    constructor(name: string, dificulty: number, moveInterval: number) {
        super(name);

        this.dificulty = dificulty;
        AdminEnemy.AllAdmins.push(this);

        this.moveInterval = moveInterval;
    }

    printName() {
        return (
            escapeString(this.name, EscapeCodes.FgRed, EscapeCodes.Blink) +
            escapeString(
                `\t(${this.dificulty.toString()})`,
                EscapeCodes.FgWhite,
                EscapeCodes.Dim
            )
        );
    }

    remove() {
        super.remove();

        AdminEnemy.AllAdmins.splice(AdminEnemy.AllAdmins.indexOf(this), 1);
    }
}

class ImportantFile extends Item {
    value: number;
    constructor(name: string, value: number) {
        super(name);

        this.value = value;
    }
    printName(): string {
        return (
            escapeString(this.name, EscapeCodes.FgYellow, EscapeCodes.BgBlack) +
            escapeString(
                "\t(" + this.value.toString() + "MB)",
                EscapeCodes.Dim,
                EscapeCodes.BgBlack
            )
        );
    }
}

const levelRoot = new Dir("/", [
    new Dir("user/", [
        new Dir("tez/", [
            new Dir("code/", [
                new Dir("game_jam/", [
                    new TextFile("hacking-game.txt", "// TODO: Make game."),
                    new ImportantFile("node_modules", 20),
                ]),
            ]),
            new AdminEnemy("AdminTez", 5, 2),
        ]),
        new Dir("historymaker/", [
            new Dir("skyrim/", [
                new ImportantFile("skyrim", 15),
                new ImportantFile(".savefile", 20),
            ]),
        ]),
        new Dir("admin/"),
    ]),
    new Dir("device/", [
        new Dir("gpu/", [
            new Dir("drivers/"),
            new AdminEnemy("VulkanProgrammer", 6, 8),
        ]),
    ]),
    new Dir("programs/", [
        new Dir("vim/", [new ImportantFile("vimconfig", 5)]),
        new Dir("bank/", [
            new Dir("misc/"),
            new AdminEnemy("cfo", 5, -1),
            new AdminEnemy("guardian", 6, -1),
            new ImportantFile("crypto-keys", 40),
        ]),
        new Dir("macrohard/", [new AdminEnemy("HaxorDeletor", 10, 5)]),
    ]),
    new Dir("system/", [
        new Dir("os/"),
        new TextFile("keys.txt"),
        new TextFile("registry.txt"),
        new ImportantFile("private_keys", 10),
    ]),
    new TextFile(
        "README.txt",
        `
You've connected to a highly secure mainframe.
All files are to be treated as highly confidential.
Under no circumstances may important files 
(indicated by their distinctive names: ${new ImportantFile(
            "ImportantFile",
            5
        ).printName()})
be deleted and most importantly copied.
`
    ),
    new ImportantFile("plaintext_passwords", 5),
    new AdminEnemy("JuniorAdmin", 4, 1),
]);

class Player {
    location!: Dir;
    readonly maxHealth = 10;
    health: number = 10;

    turnsInDirectory = 0;

    dataStolen = 0;

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

    setLocation(dir: Dir) {
        this.turnsInDirectory = 0;
        this.location = dir;
    }
}

const player = new Player();
player.setLocation(levelRoot);

const commands = {
    look: {
        desc: "Shows the current dir contents.",
        exec(otherArgs: string[]) {
            console.log(player.location.onLook(), "\n");
        },
    },
    goto: {
        desc: "[dir name] Changes to the specified directory. Use '../' to return to the parent dir.",
        exec(otherArgs: string[]) {
            if (otherArgs.length !== 1) {
                console.log("Too many args");
                return;
            }

            const targetName = otherArgs[0];
            const target = player.location.items[targetName];

            if (target && target instanceof Dir) {
                player.setLocation(target);
                return;
            } else if (otherArgs[0] === "../") {
                player.setLocation(player.location.parent ?? player.location);
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
                currentHackingGame = new HackingGame(enemy);
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
    read: {
        desc: "Displays the contents of a .txt file.",
        exec([filename]) {
            const file = player.location.items[filename];
            if (file && file instanceof TextFile) {
                console.log(file.onRead());
                return;
            }

            console.log(
                escapeString("No Text file named: ", EscapeCodes.FgYellow),
                filename
            );
        },
    },
    steal: {
        desc: "[filename] Steals an important file.",
        exec([filename]) {
            const file = player.location.items[filename];
            if (file && file instanceof ImportantFile) {
                player.dataStolen += file.value;
                file.remove();
                printMessage(
                    file.printName() +
                        " has been stolen. +" +
                        file.value.toString() +
                        "MB"
                );
                return;
            }

            console.log(
                escapeString("No Important file named: ", EscapeCodes.FgYellow),
                filename
            );
        },
    },
    quit: {
        desc: "Exit the game. Quit while your ahead before the admins steal your data back.",
        exec() {
            console.log(
                "QUITTING" +
                    spacer +
                    "total data stolen is " +
                    player.dataStolen.toString() +
                    "MB."
            );

            const message = "THANK YOU FOR PLAYING";

            const colors = [
                EscapeCodes.FgRed,
                EscapeCodes.FgYellow,
                EscapeCodes.FgGreen,
                EscapeCodes.FgCyan,
                EscapeCodes.FgBlue,
                EscapeCodes.FgMagenta,
            ];

            let str = "\t\t";

            for (let i = 0; i < message.length; i++) {
                str += escapeString(
                    message[i],
                    EscapeCodes.Blink,
                    colors[i % colors.length]
                );
            }

            printMessage(str);
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
                    .join("\n"),
                "\n"
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
let turnNumber = 0;

/**
 * Admins can move every n turns.
 * Admins can move to a parent or a random child directory
 *
 * Admins wont move if the player is in the same directory as them.
 */

const tickAdminAi = () => {
    turnNumber++;

    let hasAnyMoved = false;
    for (const admin of AdminEnemy.AllAdmins) {
        if (admin.parent == player.location || admin.moveInterval === -1) {
            continue;
        }

        if (turnNumber % admin.moveInterval != 0) continue;

        const moveDir = Math.random() > 0.5 ? "parent" : "child";

        const oldParent = admin.parent!;

        switch (moveDir) {
            case "child":
                const dirsInParent = Object.values(admin.parent!.items).filter(
                    (e) => e instanceof Dir
                ) as Dir[];

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
            hasAnyMoved = true;
            // console.log(
            //     escapeString(
            //         admin.name + " moved to " + admin.fullPath(),
            //         EscapeCodes.Dim
            //     )
            // );
        }
    }

    if (hasAnyMoved) printMessage("Admins have moved");
};

const handleTraverseInput = (value: string) => {
    tickAdminAi();

    player.location.visited = true;

    const args = value.split(" ");

    const command = commands[args[0] as keyof typeof commands];
    if (!command) {
        console.log("Unknown Command: ", args[0]);
    } else {
        command.exec(args.slice(1));
    }

    if (command === commands.quit) {
        // Stop the game immediately
        rl.close();
        return;
    }

    getNextInput();
};

const handleHackingInput = (value: string) => {
    const result = currentHackingGame.guess(value);

    switch (result.type) {
        case "complete":
            currentHackingGame.enemy.remove();
            console.log(
                escapeString("SUCCESS", EscapeCodes.FgGreen) +
                    spacer +
                    currentHackingGame.enemy.printName() +
                    escapeString(" DELETED", EscapeCodes.FgGreen)
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
            const dataLostPerFailure = 3;
            printMessage("FAILURE: LockOut initiated. ");
            printMessage(
                "Data lost: " +
                    escapeString(
                        "-" + dataLostPerFailure.toString() + "MB",
                        EscapeCodes.FgGray
                    )
            );

            player.dataStolen = Math.max(
                player.dataStolen - dataLostPerFailure,
                0
            );

            currentState = GameState.TRAVERSE;
            getNextInput();
            return;
    }
};

let currentHackingGame: HackingGame;

const getNextInput = () => {
    switch (currentState) {
        case GameState.TRAVERSE:
            if (AdminEnemy.AllAdmins.length === 0) {
                console.log("All root admins have been deleted, You Win.\n");

                rl.close();
                return;
            }

            // If there's enemies in this room, take 1 damage per enemy
            if (player.turnsInDirectory > 0) {
                const damage = Object.values(player.location.items).filter(
                    (item) => item instanceof AdminEnemy
                ).length;

                if (!!damage) {
                    player.health -= damage;

                    printMessage(
                        escapeString("\tYou have taken ") +
                            escapeString(
                                damage.toString(),
                                EscapeCodes.FgCyan
                            ) +
                            escapeString(" Damage\t")
                    );
                }
            }

            if (player.health <= 0) {
                console.log(
                    "\n",
                    "You got caught",
                    "\nYou successfully stole" +
                        escapeString(
                            player.dataStolen.toString() + "MB",
                            EscapeCodes.FgGray
                        ) +
                        "of data."
                );
                rl.close();
                return;
            }

            rl.question(
                locationPrefix +
                    spacer +
                    player.printHealth() +
                    " " +
                    escapeString(player.dataStolen + "MB", EscapeCodes.FgGray) +
                    spacer +
                    escapeString(
                        player.location.fullPath() + ">",
                        EscapeCodes.FgYellow,
                        EscapeCodes.Dim
                    ),
                handleTraverseInput
            );

            player.turnsInDirectory++;
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

console.log(
    escapeString(`
Welcome to ROOTUSER, hack into the mainfraim and steal as much data as you can.
Be sure not to get deleted by the ADMINs, they will steal back data from you.
If you're in too deep you can 'quit' while youre ahead to leave with whatever
data you've got so far.\n\n`)
);

commands["help"].exec();

getNextInput();
