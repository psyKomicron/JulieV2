"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevels = exports.Printer = void 0;
const readline = require("readline");
const FileSystem_1 = require("../dal/FileSystem");
const Command_1 = require("../bot/discord/commands/Command");
const Config_1 = require("../dal/Config");
class Printer {
    static init() {
        this.level = Config_1.Config.getVerbose();
    }
    static startUp() {
        if (!this.level) {
            this.init();
        }
        this.printEscCode(EscapeCodes.ClearScreen);
        this.printEscCode(EscapeCodes.HideCursor);
        readline.cursorTo(process.stdout, 0, 7);
        process.stdout.write(this.appTitle());
    }
    static printConfig() {
        let reduced = "";
        let wtf = Config_1.Config.getKeys().keys();
        Config_1.Config.getKeys().forEach((value, key) => {
            reduced += key + ", ";
        });
        reduced = reduced.substring(0, reduced.length - 2);
        Printer.title("Current config");
        Printer.args([
            "prefix",
            "verbose level",
            "authorized users",
            "current guild",
            "available keys"
        ], [
            Config_1.Config.getPrefix(),
            Config_1.Config.getVerbose().toString(),
            Config_1.Config.getAuthorizedUsers().reduce((previous, current) => previous += ", " + current),
            Config_1.Config.getGuild(),
            reduced
        ], false, false);
    }
    static print(content) {
        if (this.level > 1) {
            console.log(content);
            this.lines++;
        }
    }
    static clearPrint(content, position = null) {
        if (!position) {
            this.printEscCode(EscapeCodes.ClearScreen);
        }
        else {
            readline.moveCursor(process.stdout, position[0], position[1]);
            readline.clearLine(process.stdout, 0);
        }
        console.log(content);
        this.lines++;
    }
    static title(content) {
        if (this.level >= 1) {
            if (Command_1.Command.commands > 10) {
                this.printEscCode(EscapeCodes.ClearScreen);
                this.lines = 0;
                readline.cursorTo(process.stdout, 0, 0);
            }
            let tac = "";
            let max = 15 - (content.toString().length / 2);
            for (let i = 0; i < max; i++)
                tac += "-";
            console.log(`${tac}  ${content}  ${tac}`);
            this.lines++;
        }
    }
    static args(contents, values, inline = false, cut = true) {
        if (contents.length == values.length) {
            if (this.level >= 2) {
                let maxLength = -1;
                for (let i = 0; i < contents.length; i++) {
                    if (contents[i].length > maxLength) {
                        maxLength = contents[i].length;
                    }
                }
                maxLength += Printer.ARGS_SPACES;
                let lines = "";
                for (let i = 0; i < contents.length; i++) {
                    let arg = "↳ " + Printer.pCyan(contents[i]);
                    while (arg.length - Printer.pCyan("").length < maxLength) {
                        arg += " ";
                    }
                    if (inline && i % 3 != 0) {
                        if (cut) {
                            arg += ` : ${Printer.shorten(values[i])} `;
                        }
                        else {
                            arg += ` : ${values[i]}`;
                        }
                    }
                    else {
                        if (cut) {
                            arg += ` : ${Printer.shorten(values[i])} \n`;
                        }
                        else {
                            arg += ` : ${values[i]} \n`;
                        }
                    }
                    lines += arg;
                }
                console.log(lines);
            }
        }
        else {
            Printer.error("Contents & values not the same size !");
        }
    }
    static info(content) {
        if (this.level > 1) {
            console.log(this.pGreen(`${content}`));
        }
    }
    static warn(content) {
        if (this.level > 2) {
            console.log(this.pYell(`${content}`));
            this.lines++;
        }
    }
    static error(content) {
        console.error(this.pRed(content));
        this.lines++;
    }
    static hideCursor() {
        this.printEscCode(EscapeCodes.HideCursor);
    }
    static saveCursor() {
        this.printEscCode(EscapeCodes.SaveCursor);
    }
    static restoreCursor() {
        this.printEscCode(EscapeCodes.RestoreCursor);
    }
    static clear() {
        readline.cursorTo(process.stdout, 0, this.lines);
        console.log(EscapeCodes.ClearScreen);
        readline.cursorTo(process.stdout, 0, 0);
        this.lines = 0;
    }
    static repeat(c, times) {
        let str = c;
        for (let i = 1; i < times; i++) {
            str += c;
        }
        return str;
    }
    static shorten(name) {
        if (!name || name.length == 0) {
            return "not valued";
        }
        else if (name.length > Printer.LONG_STRING_MAX_LENGTH) {
            let firstName = "";
            for (var i = 0; i < 10; i++) {
                firstName += name.charAt(i);
            }
            firstName += "[...]";
            let endName = "";
            for (var j = name.length - 10; j < name.length; j++) {
                endName += name.charAt(j);
            }
            return firstName + endName;
        }
        else {
            return name;
        }
    }
    static writeLog(message, level) {
        FileSystem_1.FileSystem.appendToFile(`${this.filepath}${this.logFileName}.log`, this.formatLog(message, level));
    }
    static pRed(content) {
        return this.printColor(content, Colors.Red);
    }
    static pGreen(content) {
        return this.printColor(content, Colors.Green);
    }
    static pBlue(content) {
        return this.printColor(content, Colors.Blue);
    }
    static pYell(content) {
        return this.printColor(content, Colors.Yellow);
    }
    static pPurp(content) {
        return this.printColor(content, Colors.Purple);
    }
    static pCyan(content) {
        return this.printColor(content, Colors.Cyan);
    }
    static pWhite(content) {
        return this.printColor(content, Colors.White);
    }
    static pBlack(content) {
        return this.printColor(content, Colors.Black);
    }
    static printColor(content, color) {
        return color + content + Colors.Reset;
    }
    static printEscCode(code) {
        process.stdout.write(code);
    }
    static appTitle() {
        let spaces = 8;
        let title = "Julie V2";
        let right = "<<<<<";
        let left = ">>>>>";
        let dash = this.repeat("-", title.length + right.length * 2 + spaces * 2);
        let str = dash + "\n";
        str += left + this.repeat(" ", spaces) + title + this.repeat(" ", spaces) + right + "\n";
        str += left + this.repeat(" ", title.length + spaces * 2) + right + "\n";
        str += dash;
        this.lines += 4;
        return this.pRed(str);
    }
    static formatLog(message, logLevel) {
        let output = logLevel.toString() + "(" + new Date(Date.now()).toISOString() + ") ";
        let indent = output.length - 1;
        for (let i = 0; i < message.length; i++) {
            if (message[i] == "\n") {
                output += message[i] + "~" + Printer.repeat(" ", indent);
            }
            else {
                output += message[i];
            }
        }
        return output + "\n";
    }
}
exports.Printer = Printer;
Printer.filepath = "./files/logs/";
Printer.logFileName = "command_logs";
Printer.ARGS_SPACES = 4;
Printer.LONG_STRING_MAX_LENGTH = 25;
Printer.lines = 0;
var EscapeCodes;
(function (EscapeCodes) {
    EscapeCodes["SaveCursor"] = "\u001B[s";
    EscapeCodes["RestoreCursor"] = "\u001B[u";
    EscapeCodes["HideCursor"] = "\u001B[?25l";
    EscapeCodes["ClearScreen"] = "\u001B[1J";
    EscapeCodes["ClearScreenR"] = "\u001B[3J";
})(EscapeCodes || (EscapeCodes = {}));
var Colors;
(function (Colors) {
    Colors["Reset"] = "\u001B[0m";
    Colors["Red"] = "\u001B[1;31m";
    Colors["Green"] = "\u001B[32m";
    Colors["Blue"] = "\u001B[34m";
    Colors["Yellow"] = "\u001B[33m";
    Colors["Purple"] = "\u001B[35m";
    Colors["Cyan"] = "\u001B[36m";
    Colors["White"] = "\u001B[37m";
    Colors["Black"] = "\u001B[30m";
})(Colors || (Colors = {}));
var LogLevels;
(function (LogLevels) {
    LogLevels["Info"] = "[INFO]   ";
    LogLevels["Error"] = "[ERROR]  ";
    LogLevels["Warning"] = "[WARNING]";
})(LogLevels = exports.LogLevels || (exports.LogLevels = {}));
//# sourceMappingURL=Printer.js.map