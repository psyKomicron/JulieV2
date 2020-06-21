import fs = require('fs');
import { Printer } from '../../console/Printer';

export interface StreamOptions
{
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    emitClose?: boolean;
    start?: number;
    end?: number;
    highWaterMark?: number;
}

export class FileSystem
{
    public static readFile(path: string): Buffer
    {
        return fs.readFileSync(path);
    }

    public static appendToFile(path: string, content: string): void
    {
        fs.appendFileSync(path, content);
    }

    public static writeFile(path: string, content: string): void
    {
        fs.writeFileSync(path, content);
    }

    public static exists(path): boolean
    {
        return fs.existsSync(path);
    }

    public static mkdir(path: string, recursive = false): string
    {
        return fs.mkdirSync(path, { recursive: recursive });
    }

    public static rmdir(path: string): void
    {
        fs.rmdirSync(path);
    }

    public static unlink(path: string): void
    {
        fs.unlinkSync(path);
    }

    public static getStats(path: string): fs.Stats
    {
        return fs.statSync(path);
    }

    public static createReadStream(path: string, opt: string | StreamOptions): fs.ReadStream
    {
        return fs.createReadStream(path, opt);
    }

    public static createWriteStream(path: string, opt: StreamOptions | string): fs.WriteStream
    {
        return fs.createWriteStream(path, opt);
    }
}

export class EmojiReader
{
    public static getEmoji(name: "green_check" | "green_cross" | "thinking" | "warning" | "red_cross" | number): string
    {
        let res = undefined;
        try
        {
            let json = JSON.parse(FileSystem.readFile("./files/emojis/emojis.json").toString());
            let emojis = json["emojis"];
            for (var i = 0; i < emojis.length; i++)
            {
                if (emojis[i].name == name)
                {
                    res = emojis[i].value;
                }
            }
        }
        catch (error)
        {
            if ((error as Error).name == "EONENT")
            {
                console.log(Printer.error(`Cannot find emoji ${name}, maybe it was deleted or hasn't been created`));
            }
            else
            {
                console.error(Printer.error((error as Error).message));
            }
        }
        return res;
    }
}

export class TokenReader
{
    public static getToken(tokenName: "youtube" | "release" | "discord"): string 
    {
        let tokenValue = "";
        switch (tokenName)
        {
            case "youtube":
                tokenValue = process.env.API_KEY;
                break;
            case "release":
                tokenValue = process.env.release;
                break;
            case "discord":
                tokenValue = process.env.token;
                break;
        }
        if (!tokenValue)
        {
            console.error("Could not get token env variable");
        }
        return tokenValue;
    }
}