import { Message, MessageEmbed } from "discord.js";
import { ArgumentError } from "../../errors/ArgumentError";
import { Tools } from "../../helpers/Tools";
import { LocalEmoji } from "../../dal/readers/emojis/LocalEmoji";
import { Printer } from "../../console/Printer";

export class MessageWrapper
{
    private _message: Message;
    private _commandContent: string;
    private _isParsed: boolean = false;
    private _parsedArgs: Map<string, string>;

    public get isParsed() { return this._isParsed; }
    
    public constructor(message: Message, commandName?: string)
    {
        this._message = message;
        this.setCommandContent(commandName);
    }

    //#region properties

    public get message(): Message
    {
        return this._message;
    }

    public get commandContent(): string
    {
        return this._commandContent;
    }
    public set commandContent(content: string)
    {
        this._commandContent = content;
    }

    public get content(): string
    {
        return this._message.cleanContent;
    }

    public get args(): Map<string, string>
    {
        return this._parsedArgs;
    }
    public set args(args: Map<string, string>)
    {
        this._parsedArgs = args;
    }

    //#endregion

    /**
     * Parse the command message content to get parameters and returns a map of the arguments name paired with their values.
     */
    public parseMessage(prefixLength: number): void
    {
        let content: string = this.preParseMessage(this.content.substring(prefixLength));

        let map = new Map<string, string>();
        let i = 0;
        while (i < content.length && i < Number.MAX_SAFE_INTEGER)
        {
            if (content[i] == "-")
            {
                if (i + 1 != content.length) 
                {
                    let key: string = "";
                    for (i += 1; i < content.length; i++) 
                    {
                        if (this.isChar(content, i))
                        {
                            key += content[i];
                        }
                        else
                        {
                            i++;
                            break;
                        }
                    }

                    let comma = false;
                    if (content[i] == "\"")
                    {
                        i++;
                        comma = true;
                    }
                    let value = "";
                    let marker = true;

                    while (i < content.length && marker && i < Number.MAX_SAFE_INTEGER)
                    {
                        if (comma && content[i] == "\"")
                        {
                            i++;
                            break;
                        }
                        
                        if (content[i] != " ")
                        {
                            value += content[i];
                        }
                        else if (comma)
                        {
                            value += content[i];
                        }
                        else 
                        {
                            marker = false;
                        }

                        if (marker) i++;
                    }

                    map.set(key, value);
                }
            }
            else i++;
        }

        this.args = map;
        this._isParsed = true;
    }

    /**
     * Safely gets a entry in a map.
     * @param args
     * @param keys
     * @param ignoreDuplicate
     */
    public getValue(keys: Array<string>, ignoreDuplicate: boolean = false): string
    {
        if (this._isParsed)
        {
            let filled: boolean = false;
            let res: string = "";

            for (var i = 0; i < keys.length; i++)
            {
                let value = this.args.get(keys[i]);
                if (value)
                {
                    if (ignoreDuplicate)
                    {
                        return value;
                    }
                    else if (!filled)
                    {
                        res = value;
                        filled = true;
                    }
                    else
                    {
                        throw new ArgumentError("Duplicate argument in command", keys[i]);
                    }
                }
            }

            return res;
        }
        else
        {
            return null;
        }
    }

    public get(key: string): string
    {
        if (this._isParsed)
        {
            return this._parsedArgs.get(key);
        }
        else
        {
            return undefined;
        }
    }

    public hasValue(keys: Array<string>, interpolate: boolean = false): boolean
    {
        if (this._isParsed)
        {
            for (var i = 0; i < keys.length; i++)
            {
                if (!Tools.isNullOrEmpty(keys[i]))
                {
                    return this._parsedArgs.has(keys[i]);
                }
            }
            return false;
        }
        else
        {
            return false;
        }
    }

    public has(key: string): boolean
    {
        if (this._isParsed)
        {
            return this._parsedArgs.has(key);
        }
        else
        {
            return undefined;
        }
    }

    //#region discord decorator

    public reply(message: string | MessageEmbed): void
    {
        this._message.reply(message);
    }

    public react(emoji: LocalEmoji): void
    {
        this.message.react(emoji.value);
    }

    public send(message: string | MessageEmbed): void
    {
        this._message.channel.send(message);
    }

    public delete(timeout: number): void
    {
        if (this.message.deletable)
        {
            if (timeout)
            {
                this.message.delete({timeout: timeout})
                    .catch(error =>
                        {
                            Printer.error("Message could not be deleted");
                            Printer.error(error.toString());
                        });
            }
            else
            {
                this.message.delete();
            }
        }
    }

    //#endregion

    
    private setCommandContent(commandName?: string)
    {
        if (this._message)
        {
            if (commandName)
            {
                this.commandContent = this.content.substring(commandName.length);
            }
            else
            {
                // auto set
                let regRes = this.content.match(/\/[a-z]+ /g);
                if (regRes && regRes.length > 0)
                {
                    this.commandContent = this.content.substring(regRes[0].length);
                }
            }
        }
    }

    private preParseMessage(rawContent: string): string
    {
        let substr = 0;

        // getting to the first argument
        while (substr < rawContent.length)
        {
            if (rawContent[substr] == " ")
            {
                while (Number.MAX_SAFE_INTEGER && substr < rawContent.length && rawContent[substr] == " ") 
                {
                    substr++;
                }

                break;
            }
            substr++;
        }

        let commas: boolean;

        for (var j = 0; j < rawContent.length; j++)
        {
            if (rawContent[j] == "\"")
            {
                commas = !commas;
            }
        }

        if (commas)
        {
            throw new SyntaxError(`Message contains a space, but not incapsulated in \" \" (at character ${j + 1})`);
        }
        this.commandContent = rawContent.substring(substr);
        return this.commandContent;
    }

    private isChar(s: string, i: number): boolean
    {
        return (s.codePointAt(i) > 47 && s.codePointAt(i) < 58)
            || (s.codePointAt(i) > 64 && s.codePointAt(i) < 91)
            || (s.codePointAt(i) > 96 && s.codePointAt(i) < 123);
    }
}