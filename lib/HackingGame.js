"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackingGame = void 0;
var _1 = require(".");
// List of words from https://www.mit.edu/~ecprice/wordlist.10000
var wordMap_json_1 = __importDefault(require("./wordMap.json"));
var HackingGame = /** @class */ (function () {
    function HackingGame(enemy) {
        this.maxAttempts = 4;
        this.impossibleGuesses = [];
        this.guesses = [];
        this.enemy = enemy;
        var numWords = Math.max(10, 2 + enemy.dificulty * 2);
        var all = wordMap_json_1.default[enemy.dificulty.toString()];
        this.words = [];
        this.attempts = this.maxAttempts;
        for (var i = 0; i < numWords; i++) {
            var index = Math.floor(Math.random() * all.length);
            this.words.push(all[index]);
        }
        this.correctWord = this.words[Math.floor(Math.random() * numWords)];
    }
    HackingGame.prototype.guess = function (word) {
        this.guesses.push(word);
        if (word == this.correctWord) {
            return { type: "complete" };
        }
        this.attempts--;
        if (this.attempts <= 0) {
            return { type: "failed" };
        }
        var similarity = 0;
        for (var charIndex = 0; charIndex < word.length; charIndex++) {
            if (this.correctWord[charIndex] === word[charIndex])
                similarity++;
        }
        if (similarity === 0) {
            this.impossibleGuesses.push(word);
        }
        return { type: "similarity", value: similarity };
    };
    HackingGame.prototype.printBoard = function () {
        var _this = this;
        var printRows = 3;
        console.log("\n\n\tHacking :: " + this.enemy.printName() + "\n");
        if (this.attempts === this.maxAttempts) {
            console.log((0, _1.escapeString)("Similarity indicates how many letters in your guess are:\n\t1) In the correct word\n\t2) In the correct position\n(Similar to getting green letters in a certain popular daily puzzle.\n", _1.EscapeCodes.Dim));
        }
        console.log(this.words
            .map(function (word) {
            // are there matching letters with an impossible word
            var matchesAny = false;
            for (var _i = 0, _a = _this.impossibleGuesses; _i < _a.length; _i++) {
                var impossible = _a[_i];
                for (var i = 0; i < impossible.length; i++) {
                    var containsChar = word[i] === impossible[i];
                    if (containsChar) {
                        matchesAny = true;
                        break;
                    }
                }
                if (matchesAny) {
                    break;
                }
            }
            if (_this.guesses.indexOf(word) != -1 &&
                _this.impossibleGuesses.indexOf(word) === -1) {
                return (0, _1.escapeString)(word, _1.EscapeCodes.FgYellow, _1.EscapeCodes.Dim);
            }
            if (matchesAny) {
                return (0, _1.escapeString)(word, _1.EscapeCodes.FgRed, _1.EscapeCodes.Dim);
            }
            if (_this.guesses.indexOf(word) != -1) {
                return (0, _1.escapeString)(word, _1.EscapeCodes.FgYellow, _1.EscapeCodes.Dim);
            }
            return word;
        })
            .reduce(function (pairs, current, i, arr) {
            if (i % printRows === 0) {
                pairs.push("\t" + arr.slice(i, i + printRows).join(" | "));
            }
            return pairs;
        }, [])
            .join("\n") + "\n");
    };
    return HackingGame;
}());
exports.HackingGame = HackingGame;
