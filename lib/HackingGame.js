"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackingGame = void 0;
var wordMap_json_1 = __importDefault(require("./wordMap.json"));
var HackingGame = /** @class */ (function () {
    function HackingGame(enemy, wordLength, numWords) {
        this.enemy = enemy;
        var all = wordMap_json_1.default[wordLength.toString()];
        this.words = [];
        this.attempts = 3;
        for (var i = 0; i < numWords; i++) {
            var index = Math.floor(Math.random() * all.length);
            this.words.push(all[index]);
        }
        this.correctWord = this.words[Math.floor(Math.random() * numWords)];
    }
    HackingGame.prototype.guess = function (word) {
        if (word == this.correctWord) {
            return { type: "complete" };
        }
        this.attempts--;
        if (this.attempts <= 0) {
            return { type: "failed" };
        }
        var similarity = 0;
        for (var charIndex = 0; charIndex < word.length; charIndex++) {
            var match = false;
            if (this.correctWord[charIndex] === word[charIndex])
                similarity++;
        }
        return { type: "similarity", value: similarity };
    };
    HackingGame.prototype.printBoard = function () {
        console.log("\n\n\tHacking ::" + this.enemy.printName());
        console.log(this.words.join("\n"));
    };
    return HackingGame;
}());
exports.HackingGame = HackingGame;
