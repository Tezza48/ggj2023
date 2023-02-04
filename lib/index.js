#!/usr/bin/env node
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminEnemy = exports.Dir = exports.Item = exports.escapeString = exports.EscapeCodes = void 0;
var readline = __importStar(require("readline"));
var HackingGame_1 = require("./HackingGame");
console.clear();
var EscapeCodes;
(function (EscapeCodes) {
    EscapeCodes["Reset"] = "0";
    EscapeCodes["Bright"] = "1";
    EscapeCodes["Dim"] = "2";
    EscapeCodes["Underscore"] = "4";
    EscapeCodes["Blink"] = "5";
    EscapeCodes["Reverse"] = "7";
    EscapeCodes["Hidden"] = "8";
    EscapeCodes["FgBlack"] = "30";
    EscapeCodes["FgRed"] = "31";
    EscapeCodes["FgGreen"] = "32";
    EscapeCodes["FgYellow"] = "33";
    EscapeCodes["FgBlue"] = "34";
    EscapeCodes["FgMagenta"] = "35";
    EscapeCodes["FgCyan"] = "36";
    EscapeCodes["FgWhite"] = "37";
    EscapeCodes["FgGray"] = "90";
    EscapeCodes["BgBlack"] = "40";
    EscapeCodes["BgRed"] = "41";
    EscapeCodes["BgGreen"] = "42";
    EscapeCodes["BgYellow"] = "43";
    EscapeCodes["BgBlue"] = "44";
    EscapeCodes["BgMagenta"] = "45";
    EscapeCodes["BgCyan"] = "46";
    EscapeCodes["BgWhite"] = "47";
    EscapeCodes["BgGray"] = "100";
})(EscapeCodes = exports.EscapeCodes || (exports.EscapeCodes = {}));
function escapeString(value) {
    var escapes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        escapes[_i - 1] = arguments[_i];
    }
    return "\u001B[".concat((escapes !== null && escapes !== void 0 ? escapes : [EscapeCodes.Reset]).join(";"), "m").concat(value, "\u001B[").concat(EscapeCodes.Reset, "m");
}
exports.escapeString = escapeString;
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
var locationPrefix = escapeString("r00tu53r", EscapeCodes.FgYellow, EscapeCodes.Dim);
var spacer = escapeString(" :: ", EscapeCodes.FgCyan, EscapeCodes.Dim);
var printMessage = function (message) {
    console.log(escapeString("m3ss4ge", EscapeCodes.FgGray, EscapeCodes.Blink) +
        spacer +
        escapeString(message, EscapeCodes.FgGray, EscapeCodes.Blink));
};
var Item = /** @class */ (function () {
    function Item(name) {
        this.name = name;
    }
    Item.prototype.printName = function () {
        return this.name;
    };
    Item.prototype.setDirectory = function (dir) {
        if (this.parent) {
            delete this.parent.items[this.name];
        }
        dir.items[this.name] = this;
        this.parent = dir;
    };
    /**
     * Removes an item from the filesystem.
     */
    Item.prototype.remove = function () {
        var _a;
        (_a = this.parent) === null || _a === void 0 ? true : delete _a.items[this.name];
    };
    Item.prototype.fullPath = function () {
        return this.parent ? this.parent.fullPath() + this.name : this.name;
    };
    return Item;
}());
exports.Item = Item;
var TextFile = /** @class */ (function (_super) {
    __extends(TextFile, _super);
    function TextFile(name, text) {
        var _this = _super.call(this, name) || this;
        _this.text = text;
        return _this;
    }
    TextFile.prototype.onRead = function () {
        return this.text;
    };
    return TextFile;
}(Item));
var Dir = /** @class */ (function (_super) {
    __extends(Dir, _super);
    function Dir(name, items) {
        var _this = _super.call(this, name) || this;
        _this.visited = false;
        _this.items = Object.fromEntries((items !== null && items !== void 0 ? items : []).map(function (e) { return [e.name, e]; }));
        if (items) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                item.parent = _this;
            }
        }
        return _this;
    }
    Dir.prototype.printName = function () {
        return escapeString.apply(void 0, __spreadArray([_super.prototype.printName.call(this)], (this.visited
            ? [EscapeCodes.FgCyan, EscapeCodes.Dim]
            : [EscapeCodes.FgCyan]), false));
    };
    Dir.prototype.onLook = function () {
        var ret = "";
        if (Object.values(this.items).length > 0) {
            ret += Object.values(this.items)
                .map(function (i) { return "\t" + i.printName() + "\n"; })
                .join("");
        }
        if (this.parent)
            ret += escapeString("\t../", EscapeCodes.FgCyan, EscapeCodes.Dim);
        return ret;
    };
    return Dir;
}(Item));
exports.Dir = Dir;
var AdminEnemy = /** @class */ (function (_super) {
    __extends(AdminEnemy, _super);
    function AdminEnemy(name, dificulty) {
        var _this = _super.call(this, name) || this;
        _this.dificulty = dificulty;
        AdminEnemy.AllAdmins.push(_this);
        return _this;
    }
    AdminEnemy.prototype.printName = function () {
        return (escapeString(this.name, EscapeCodes.FgRed, EscapeCodes.Blink) +
            escapeString("\t(".concat(this.dificulty.toString(), ")"), EscapeCodes.FgWhite, EscapeCodes.Dim));
    };
    AdminEnemy.prototype.remove = function () {
        _super.prototype.remove.call(this);
        AdminEnemy.AllAdmins.splice(AdminEnemy.AllAdmins.indexOf(this), 1);
    };
    AdminEnemy.AllAdmins = [];
    return AdminEnemy;
}(Item));
exports.AdminEnemy = AdminEnemy;
var ImportantFile = /** @class */ (function (_super) {
    __extends(ImportantFile, _super);
    function ImportantFile(name, value) {
        var _this = _super.call(this, name) || this;
        _this.value = value;
        return _this;
    }
    ImportantFile.prototype.printName = function () {
        return (escapeString(this.name, EscapeCodes.FgYellow, EscapeCodes.BgBlack) +
            escapeString("\t(" + this.value.toString() + "MB)", EscapeCodes.Dim, EscapeCodes.BgBlack));
    };
    return ImportantFile;
}(Item));
var levelRoot = new Dir("/", [
    new Dir("user/", [
        new Dir("tez/", [
            new Dir("code/", [new Dir("game_jam/")]),
            new AdminEnemy("AdminTez", 5),
        ]),
        new Dir("history/", [new Dir("skyrim_mods/")]),
        new Dir("admin/"),
    ]),
    new Dir("device/", [
        new Dir("gpu/", [
            new Dir("drivers/"),
            new AdminEnemy("AdminVulkan", 5),
        ]),
    ]),
    new Dir("programs/", [
        new Dir("macrohard/", [new AdminEnemy("Hax0rDltr", 10)]),
    ]),
    new TextFile("README.txt", "\nYou've connected to a highly secure mainframe.\nAll files are to be treated as highly confidential.\nUnder no circumstances may important files \n(indicated by their distinctive names: ".concat(new ImportantFile("ImportantFile", 5).printName(), ")\nbe deleted and most importantly copied.\n")),
    new ImportantFile("plaintext_passwords", 5),
]);
var Player = /** @class */ (function () {
    function Player() {
        this.maxHealth = 10;
        this.health = 10;
        this.turnsInDirectory = 0;
        this.dataStolen = 0;
    }
    Player.prototype.printHealth = function () {
        var str = "";
        for (var i = 1; i <= this.maxHealth; i++) {
            if (i < this.health) {
                str += escapeString("▓", EscapeCodes.FgGreen, EscapeCodes.Bright);
            }
            else if (i === this.health) {
                str += escapeString("▒", EscapeCodes.FgGreen, EscapeCodes.Blink);
            }
            else {
                str += escapeString("░", EscapeCodes.FgRed, EscapeCodes.Dim);
            }
        }
        return str;
    };
    Player.prototype.setLocation = function (dir) {
        this.turnsInDirectory = 0;
        this.location = dir;
    };
    return Player;
}());
var player = new Player();
player.setLocation(levelRoot);
var commands = {
    look: {
        desc: "Shows the current dir contents.",
        exec: function (otherArgs) {
            console.log(player.location.onLook(), "\n");
        },
    },
    goto: {
        desc: "[dir name] Changes to the specified directory. Use '../' to return to the parent dir.",
        exec: function (otherArgs) {
            var _a;
            if (otherArgs.length !== 1) {
                console.log("Too many args");
                return;
            }
            var targetName = otherArgs[0];
            var target = player.location.items[targetName];
            if (target && target instanceof Dir) {
                player.setLocation(target);
                return;
            }
            else if (otherArgs[0] === "../") {
                player.setLocation((_a = player.location.parent) !== null && _a !== void 0 ? _a : player.location);
            }
            else {
                console.log("Cannot goto", targetName);
            }
        },
    },
    attack: {
        desc: "[target name] Attack a root admin.",
        exec: function (_a) {
            var enemyName = _a[0];
            var enemy = player.location.items[enemyName];
            if (enemy && enemy instanceof AdminEnemy) {
                currentHackingGame = new HackingGame_1.HackingGame(enemy);
                currentState = GameState.COMBAT;
                return;
            }
            process.stdout.write("a");
            console.log(escapeString("No root user named: ", EscapeCodes.FgYellow), escapeString(enemyName, EscapeCodes.FgRed, EscapeCodes.Dim));
        },
    },
    read: {
        desc: "Displays the contents of a .txt file.",
        exec: function (_a) {
            var filename = _a[0];
            var file = player.location.items[filename];
            if (file && file instanceof TextFile) {
                console.log(file.onRead());
                return;
            }
            console.log(escapeString("No Text file named: ", EscapeCodes.FgYellow), filename);
        },
    },
    steal: {
        desc: "[filename] Steals an important file.",
        exec: function (_a) {
            var filename = _a[0];
            var file = player.location.items[filename];
            if (file && file instanceof ImportantFile) {
                player.dataStolen += file.value;
                file.remove();
                printMessage(file.printName() +
                    " has been stolen. +" +
                    file.value.toString() +
                    "MB");
                return;
            }
            console.log(escapeString("No Important file named: ", EscapeCodes.FgYellow), filename);
        },
    },
    quit: {
        desc: "Exit the game. Quit while your ahead before the admins steal your data back.",
        exec: function () {
            console.log("QUITTING" +
                spacer +
                "total data stolen is " +
                player.dataStolen.toString() +
                "MB.");
        },
    },
    help: {
        desc: "Displays descriptions of all commands.",
        exec: function () {
            console.log(Object.entries(commands)
                .map(function (_a) {
                var key = _a[0], desc = _a[1].desc;
                return (escapeString(key + ":") +
                    " " +
                    escapeString(desc, EscapeCodes.FgYellow, EscapeCodes.Dim));
            })
                .join("\n"));
        },
    },
};
var GameState;
(function (GameState) {
    GameState[GameState["TRAVERSE"] = 0] = "TRAVERSE";
    GameState[GameState["COMBAT"] = 1] = "COMBAT";
})(GameState || (GameState = {}));
var currentState = GameState.TRAVERSE;
var aiMoveInterval = 3;
var traverseMoves = 0;
/**
 * Admins can move every n turns.
 * Admins can move to a parent or a random child directory
 *
 * Admins wont move if the player is in the same directory as them.
 */
var tickAdminAi = function () {
    var _a;
    traverseMoves++;
    if (traverseMoves % aiMoveInterval != 0)
        return;
    for (var _i = 0, _b = AdminEnemy.AllAdmins; _i < _b.length; _i++) {
        var admin = _b[_i];
        if (admin.parent == player.location) {
            continue;
        }
        var moveDir = Math.random() > 0.5 ? "parent" : "child";
        var oldParent = admin.parent;
        switch (moveDir) {
            case "child":
                var dirsInParent = Object.values(admin.parent.items).filter(function (e) { return e instanceof Dir; });
                if (dirsInParent.length > 0) {
                    var newDir = dirsInParent[Math.floor(Math.random() * dirsInParent.length)];
                    admin.setDirectory(newDir);
                }
                break;
            case "parent":
                if ((_a = admin.parent) === null || _a === void 0 ? void 0 : _a.parent) {
                    var newDir = admin.parent.parent;
                    admin.setDirectory(newDir);
                }
                break;
        }
        if (admin.parent !== oldParent) {
            // console.log(
            //     escapeString(
            //         admin.name + " moved to " + admin.fullPath(),
            //         EscapeCodes.Dim
            //     )
            // );
        }
    }
    printMessage("Admins have moved");
};
var handleTraverseInput = function (value) {
    tickAdminAi();
    player.location.visited = true;
    var args = value.split(" ");
    var command = commands[args[0]];
    if (!command) {
        console.log("Unknown Command: ", args[0]);
    }
    else {
        command.exec(args.slice(1));
    }
    if (command === commands.quit) {
        // Stop the game immediately
        rl.close();
        return;
    }
    getNextInput();
};
var handleHackingInput = function (value) {
    var result = currentHackingGame.guess(value);
    switch (result.type) {
        case "complete":
            currentHackingGame.enemy.remove();
            console.log(escapeString("SUCCESS", EscapeCodes.FgGreen) +
                spacer +
                currentHackingGame.enemy.printName() +
                escapeString(" DELETED", EscapeCodes.FgGreen));
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
            var dataLostPerFailure = 3;
            printMessage("FAILURE: LockOut initiated. ");
            printMessage("Data lost: " +
                escapeString("-" + dataLostPerFailure.toString() + "MB", EscapeCodes.FgGray));
            player.dataStolen = Math.max(player.dataStolen - dataLostPerFailure, 0);
            currentState = GameState.TRAVERSE;
            getNextInput();
            return;
    }
};
var currentHackingGame;
var getNextInput = function () {
    switch (currentState) {
        case GameState.TRAVERSE:
            if (AdminEnemy.AllAdmins.length === 0) {
                console.log("All root admins have been deleted, You Win.\n");
                rl.close();
                return;
            }
            // If there's enemies in this room, take 1 damage per enemy
            if (player.turnsInDirectory > 0) {
                var damage = Object.values(player.location.items).filter(function (item) { return item instanceof AdminEnemy; }).length;
                if (!!damage) {
                    player.health -= damage;
                    printMessage(escapeString("\tYou have taken ") +
                        escapeString(damage.toString(), EscapeCodes.FgCyan) +
                        escapeString(" Damage\t"));
                }
            }
            if (player.health <= 0) {
                console.log("\n", "You got caught", "\nYou successfully stole" +
                    escapeString(player.dataStolen.toString() + "MB", EscapeCodes.FgGray) +
                    "of data.");
                rl.close();
                return;
            }
            rl.question(locationPrefix +
                spacer +
                player.printHealth() +
                " " +
                escapeString(player.dataStolen + "MB", EscapeCodes.FgGray) +
                spacer +
                escapeString(player.location.fullPath() + ">", EscapeCodes.FgYellow, EscapeCodes.Dim), handleTraverseInput);
            player.turnsInDirectory++;
            break;
        case GameState.COMBAT:
            currentHackingGame.printBoard();
            rl.question("Hacking" +
                spacer +
                escapeString(currentHackingGame.attempts.toString(), EscapeCodes.Underscore, EscapeCodes.FgCyan) +
                " Attepmpts" +
                spacer +
                " >", handleHackingInput);
            break;
    }
};
commands["help"].exec();
getNextInput();
