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
var Item = /** @class */ (function () {
    function Item(name) {
        this.name = name;
    }
    Item.prototype.printName = function () {
        return this.name;
    };
    Item.prototype.remove = function () {
        var _a;
        (_a = this.parent) === null || _a === void 0 ? true : delete _a.items[this.name];
    };
    return Item;
}());
exports.Item = Item;
var Dir = /** @class */ (function (_super) {
    __extends(Dir, _super);
    function Dir(name, items) {
        var _this = _super.call(this, name) || this;
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
        return escapeString(_super.prototype.printName.call(this), EscapeCodes.FgCyan);
    };
    Dir.prototype.fullPath = function () {
        return this.parent ? this.parent.fullPath() + this.name : this.name;
    };
    Dir.prototype.onLook = function () {
        if (Object.values(this.items).length === 0) {
            return "There is nothing in this directory";
        }
        return Object.values(this.items)
            .map(function (i) { return "\t" + i.printName(); })
            .join("\n");
    };
    return Dir;
}(Item));
exports.Dir = Dir;
var AdminEnemy = /** @class */ (function (_super) {
    __extends(AdminEnemy, _super);
    function AdminEnemy(name) {
        var _this = _super.call(this, name) || this;
        AdminEnemy.NumEnemies++;
        return _this;
    }
    AdminEnemy.prototype.printName = function () {
        return escapeString(this.name, EscapeCodes.FgRed, EscapeCodes.Blink);
    };
    AdminEnemy.prototype.remove = function () {
        _super.prototype.remove.call(this);
        AdminEnemy.NumEnemies--;
    };
    AdminEnemy.NumEnemies = 0;
    return AdminEnemy;
}(Item));
exports.AdminEnemy = AdminEnemy;
// prettier-ignore
var levelRoot = new Dir("/", [
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
var Player = /** @class */ (function () {
    function Player() {
        this.maxHealth = 10;
        this.health = 10;
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
    return Player;
}());
var player = new Player();
player.location = levelRoot;
var commands = {
    look: {
        desc: "Shows the current dir contents.",
        exec: function (otherArgs) {
            console.log(player.location.onLook(), "\n");
        },
    },
    goto: {
        desc: "[dir name] Changes to the specified directory.",
        exec: function (otherArgs) {
            var _a;
            if (otherArgs.length !== 1) {
                console.log("Too many args");
                return;
            }
            var targetName = otherArgs[0];
            var target = player.location.items[targetName];
            if (target && target instanceof Dir) {
                player.location = target;
                return;
            }
            else if (otherArgs[0] === "..") {
                player.location = (_a = player.location.parent) !== null && _a !== void 0 ? _a : player.location;
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
                currentHackingGame = new HackingGame_1.HackingGame(enemy, 5, 15);
                currentState = GameState.COMBAT;
                return;
            }
            process.stdout.write("a");
            console.log(escapeString("No root user named: ", EscapeCodes.FgYellow), escapeString(enemyName, EscapeCodes.FgRed, EscapeCodes.Dim));
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
var handleTraverseInput = function (value) {
    var args = value.split(" ");
    var command = commands[args[0]];
    if (!command) {
        console.log("Unknown Command: ", args[0]);
    }
    else {
        command.exec(args.slice(1));
    }
    getNextInput();
};
var handleHackingInput = function (value) {
    var result = currentHackingGame.guess(value);
    switch (result.type) {
        case "complete":
            currentHackingGame.enemy.remove();
            console.log(escapeString("SUCCESS :: ", EscapeCodes.FgGreen) +
                currentHackingGame.enemy.printName() +
                escapeString(" Deleted", EscapeCodes.FgGreen));
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
var currentHackingGame; //= new HackingGame(new AdminEnemy("TesstEnemy"), 5, 15);
var getNextInput = function () {
    switch (currentState) {
        case GameState.TRAVERSE:
            if (AdminEnemy.NumEnemies === 0) {
                console.log("All root admins have been deleted, You Win.\n");
                rl.close();
                return;
            }
            // If there's enemies in this room, take 1 damage per enemy
            var damage = Object.values(player.location.items).filter(function (item) { return item instanceof AdminEnemy; }).length;
            if (!!damage) {
                player.health -= damage;
                console.log(escapeString("\tYou have taken ", EscapeCodes.BgGray, EscapeCodes.FgYellow) +
                    escapeString(damage.toString(), EscapeCodes.BgGray, EscapeCodes.FgCyan) +
                    escapeString(" Damage\t", EscapeCodes.BgGray, EscapeCodes.FgYellow));
            }
            if (player.health <= 0) {
                console.log("\n", "You got caught");
                rl.close();
                return;
            }
            rl.question(locationPrefix +
                spacer +
                player.printHealth() +
                spacer +
                escapeString(player.location.fullPath() + ">", EscapeCodes.FgYellow, EscapeCodes.Dim), handleTraverseInput);
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
