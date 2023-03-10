#!/usr/bin/env node
export declare enum EscapeCodes {
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
    BgGray = "100"
}
export declare function escapeString(value: string, ...escapes: EscapeCodes[]): string;
export declare class Item {
    name: string;
    parent?: Dir;
    constructor(name: string);
    printName(): string;
    setDirectory(dir: Dir): void;
    /**
     * Removes an item from the filesystem.
     */
    remove(): void;
    fullPath(): string;
}
export declare class Dir extends Item {
    visited: boolean;
    parent?: Dir;
    items: Record<string, Item>;
    constructor(name: `${string}/`, items?: Item[]);
    printName(): string;
    onLook(): string;
}
export declare class AdminEnemy extends Item {
    static AllAdmins: AdminEnemy[];
    dificulty: number;
    moveInterval: number;
    constructor(name: string, dificulty: number, moveInterval: number);
    printName(): string;
    remove(): void;
}
