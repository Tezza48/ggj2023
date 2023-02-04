const fs = require("fs");

const wordList = fs.readFileSync("./src/wordlist.txt", "utf-8");

const wordMap = wordList.split("\r\n").reduce((map, current) => {
    if (!map[current.length]) map[current.length] = [];

    map[current.length].push(current);

    return map;
}, {});

fs.writeFileSync("./src/wordMap.json", JSON.stringify(wordMap), "utf-8");
