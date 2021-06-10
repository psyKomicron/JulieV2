import readline = require('readline');
import { FileSystem as fs } from '../dal/FileSystem';
import { Command } from '../bot/discord/commands/Command';
import { Config } from '../dal/Config';

export class Printer
{
    static readonly filepath = "./files/logs/";
    static readonly logFileName = "command_logs";
    public static ARGS_SPACES: number = 4;
    public static LONG_STRING_MAX_LENGTH: number = 25;

    private static level: number;
    private static lines: number = 0;

    public static init(): void
    {
        this.level = Config.getVerbose();
    }

    public static startUp(): void
    {
        if (!this.level)
        {
            this.init();
        }
        this.printEscCode(EscapeCodes.ClearScreen);
        this.printEscCode(EscapeCodes.HideCursor);
        readline.cursorTo(process.stdout, 0, 7);
        process.stdout.write(this.appTitle());
    }

    public static printConfig(): void
    {
        let reduced: string = "";
        let wtf = Config.getKeys().keys();
        Config.getKeys().forEach((value, key) => 
        {
            reduced += key + ", ";
        });
        reduced = reduced.substring(0, reduced.length - 2);

        Printer.title("Current config");
        Printer.args(
            [
                "prefix", 
                "verbose level", 
                "authorized users", 
                "current guild",
                "available keys"
            ], 
            [
                Config.getPrefix(), 
                Config.getVerbose().toString(), 
                Config.getAuthorizedUsers().reduce((previous, current) => previous += ", " + current),
                Config.getGuild(),
                reduced
            ]
        , false, false);
    }

    public static print(content: any): void
    {
        if (this.level > 1)
        {
            console.log(content);
            this.lines++;
        }
    }

    public static clearPrint(content: string, position: [number, number] = null): void
    {
        if (!position)
        {
            this.printEscCode(EscapeCodes.ClearScreen);
        }
        else
        {
            readline.moveCursor(process.stdout, position[0], position[1]);
            readline.clearLine(process.stdout, 0);
        }
        console.log(content);
        this.lines++;
    }

    /**
     * Prints a string with dashes around
     * log_level 2
     * @param content
     */
    public static title(content: string | number): void
    {
        if (this.level >= 1)
        {
            if (Command.commands > 10)
            {
                this.printEscCode(EscapeCodes.ClearScreen);
                this.lines = 0;
                readline.cursorTo(process.stdout, 0, 0);
            }
            let tac: string = "";
            let max = 15 - (content.toString().length / 2);
            for (let i = 0; i < max; i++) tac += "-";

            console.log(`${tac}  ${content}  ${tac}`);

            this.lines++;
        }
    }

    /**
     * Returns a formatted string to display command arguments
     * log_level 2
     * @param contents
     * @param values
     */
    public static args(contents: string[], values: string[], inline: boolean = false, cut: boolean = true): void
    {
        if (contents.length == values.length)
        {
            if (this.level >= 2)
            {
                let maxLength = -1;
                for (let i = 0; i < contents.length; i++)
                {
                    if (contents[i].length > maxLength) 
                    {
                        maxLength = contents[i].length;
                    }
                }

                maxLength += Printer.ARGS_SPACES;
                let lines = "";
                for (let i = 0; i < contents.length; i++)
                {
                    let arg = "↳ " + Printer.pCyan(contents[i]);

                    while (arg.length - Printer.pCyan("").length < maxLength) 
                    {
                        arg += " ";
                    }

                    if (inline && i % 3 != 0)
                    {
                        if (cut)
                        {
                            arg += ` : ${Printer.shorten(values[i])} `;
                        }
                        else 
                        {
                            arg += ` : ${values[i]}`;
                        }
                    }
                    else
                    {
                        if (cut)
                        {
                            arg += ` : ${Printer.shorten(values[i])} \n`;
                        }
                        else 
                        {
                            arg += ` : ${values[i]} \n`;
                        }
                    }

                    lines += arg;
                }
                console.log(lines);
            }
        }
        else
        {
            Printer.error("Contents & values not the same size !");
        }
    }

    public static info(content: string | number | boolean): void
    {
        if (this.level > 1)
        {
            console.log(this.pGreen(`${content}`));
        }
    }

    /**
     * Prints string in warning color
     * @param content
     */
    public static warn(content: string | number): void
    {
        if (this.level > 2)
        {
            console.log(this.pYell(`${content}`));
            this.lines++;
        }
    }

    /**
     * Returns string in error color.
     * @param content
     */
    public static error(content: string): void
    {
        console.error(this.pRed(content));
        this.lines++;
        this.writeLog(content, LogLevels.Error);
    }

    public static hideCursor(): void
    {
        this.printEscCode(EscapeCodes.HideCursor);
    }

    public static saveCursor(): void
    {
        this.printEscCode(EscapeCodes.SaveCursor);
    }

    public static restoreCursor(): void
    {
        this.printEscCode(EscapeCodes.RestoreCursor);
    }

    public static clear(): void
    {
        readline.cursorTo(process.stdout, 0, this.lines);
        console.log(EscapeCodes.ClearScreen);
        readline.cursorTo(process.stdout, 0, 0);
        this.lines = 0;
    }

    public static repeat(c: string, times: number): string
    {
        let str = c;
        for (let i = 1; i < times; i++)
        {
            str += c;
        }
        return str;
    }

    public static shorten(name: string)
    {
        if (!name || name.length == 0)
        {
            return "not valued";
        }
        else if (name.length > Printer.LONG_STRING_MAX_LENGTH)
        {
            let firstName = "";

            for (var i = 0; i < 10; i++)
            {
                firstName += name.charAt(i);
            }
            
            firstName += "[...]";
            let endName = "";

            for (var j = name.length - 10; j < name.length; j++)
            {
                endName += name.charAt(j);
            }
            
            return firstName + endName;
        }
        else
        {
            return name;
        }
    }

    public static writeLog(message: string, level: LogLevels)
    {
        switch (level)
        {
            case LogLevels.Log:
                fs.appendToFile(`${this.filepath}${this.logFileName}`, "[LOG]" + "(" + new Date(Date.now()).toISOString() + ") " + message);
                break;
            case LogLevels.Warning:
                fs.appendToFile(`${this.filepath}${this.logFileName}`, "[WARNING]" + "(" + new Date(Date.now()).toISOString() + ") " + message);
                break;
            case LogLevels.Log:
                fs.appendToFile(`${this.filepath}${this.logFileName}`, "[ERROR]" + "(" + new Date(Date.now()).toISOString() + ") " + message);
                break;
        }
    }

    //#region colors
    public static pRed(content: string): string
    {
        return this.printColor(content, Colors.Red);
    }
    public static pGreen(content: string): string
    {
        return this.printColor(content, Colors.Green);
    }
    public static pBlue(content: string): string
    {
        return this.printColor(content, Colors.Blue);
    }
    public static pYell(content: string): string
    {
        return this.printColor(content, Colors.Yellow);
    }
    public static pPurp(content: string): string
    {
        return this.printColor(content, Colors.Purple);
    }
    public static pCyan(content: string): string
    {
        return this.printColor(content, Colors.Cyan);
    }
    public static pWhite(content: string): string
    {
        return this.printColor(content, Colors.White);
    }
    public static pBlack(content: string): string
    {
        return this.printColor(content, Colors.Black);
    }
    public static printColor(content: string, color: Colors): string
    {
        return color + content + Colors.Reset;
    }
    public static printEscCode(code: EscapeCodes)
    {
        process.stdout.write(code);
    }
    //#endregion

    private static appTitle(): string
    {
        let spaces = 8;
        let title = "Julie V2";
        let right = "<<<<<";
        let left = ">>>>>";
        let dash = this.repeat("-", title.length + right.length * 2 + spaces * 2); //37

        let str = dash + "\n";
        str += left + this.repeat(" ", spaces) + title + this.repeat(" ", spaces) + right + "\n";
        str += left + this.repeat(" ", title.length + spaces * 2) + right + "\n";
        str += dash;

        this.lines += 4;
        return this.pRed(str);
    }
}

enum EscapeCodes
{
    SaveCursor = "\u001B[s",
    RestoreCursor = "\u001B[u",
    HideCursor = "\u001B[?25l",
    ClearScreen = "\u001B[1J",
    ClearScreenR = "\u001B[3J",
}

enum Colors
{
    Reset = "\u001B[0m",
    Red = "\u001B[1;31m",
    Green = "\u001B[32m",
    Blue = "\u001B[34m",
    Yellow = "\u001B[33m",
    Purple = "\u001B[35m",
    Cyan = "\u001B[36m",
    White = "\u001B[37m",
    Black = "\u001B[30m",
}

export enum LogLevels 
{
    Log,
    Error,
    Warning
}