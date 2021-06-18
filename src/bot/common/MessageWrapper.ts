import { Collection, Guild, GuildMember, Message, MessageEmbed, TextChannel } from "discord.js";
import { ArgumentError } from "../../errors/ArgumentError";
import { Tools } from "../../helpers/Tools";
import { LocalEmoji } from "../../dal/readers/emojis/LocalEmoji";
import { LogLevels, Printer } from "../../console/Printer";
import { BotUser } from "../discord/BotUser";
import { ExecutionError } from "../../errors/ExecutionError";
import { Config } from "../../dal/Config";

export class MessageWrapper
{
    private _instanceDate: number;
    private _message: Message;
    private _commandContent: string;
    private _isParsed: boolean = false;
    private _parsedArgs: Map<string, string>;
    private _user: BotUser;

    public get isParsed() { return this._isParsed; }
    
    public constructor(message: Message, commandName?: string)
    {
        this._instanceDate = Date.now();
        this._message = message;
        if (message.author.tag == "psyKomicron#6527")
        {
            this._user = new BotUser();
            this._user.isDev = true;
        }
        this.setCommandContent(commandName);
    }

    //#region properties
    public get message(): Message { return this._message; }

    public get commandContent(): string { return this._commandContent; }
    public set commandContent(content: string) { this._commandContent = content; }

    public get content(): string { return this._message.cleanContent; }

    public get args(): Map<string, string> { return this._parsedArgs; }
    public set args(args: Map<string, string>) { this._parsedArgs = args; }

    public get author(): BotUser { return this._user; }

    public get guild(): Guild 
    { 
        if (this._message.guild.available)
        {
            return this._message.guild;
        }
        else 
        {
            return undefined;
        }
    }

    public get textChannel(): TextChannel 
    { 
        if (this._message.channel instanceof TextChannel)
        {
            return this._message.channel;
        }
        else 
        {
            return undefined;
        }
    }

    public typing(): boolean
    {
        return this.textChannel.typing;
    }
    //#endregion

    /**
     * Parse the command message content to get parameters and returns a map of the arguments name paired with their values.
     */
    public parseMessage(prefixLength: number): void
    {
        let content: string = this.preParseMessage(this.content.substring(prefixLength));
        this._parsedArgs = new Map<string, string>();
        let i = 0;

        if (content[i] != "-")
        {
            this._isParsed = true;
            return;
        }
        let maxIterations = 0;
        while (i < content.length && maxIterations < 500)
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

                    let value = "";
                    if (content[i] != "-")
                    {
                        let comma = false;
                        if (content[i] == "\"")
                        {
                            i++;
                            comma = true;
                        }
                        let marker = true;
                        while (i < content.length && marker && maxIterations < 500)
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
                            maxIterations++;
                        }
                    }
                    this._parsedArgs.set(key, value);
                }
            }
            else i++;
            maxIterations++;
        }

        if (maxIterations >= 500)
        {
            throw new ExecutionError("Could not parse message, stopped parsing to avoid overflow (iterations: " + maxIterations + ").", "ExecutionError");
        }
        else 
        {
            this._isParsed = true;
        }
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
            let res: string = undefined;

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
            return false;
        }
    }

    public hasKeys(keys: string[]): boolean
    {
        for (var i = 0; i < keys.length; i++)
        {
            if (this.has(keys[i]))
            {
                return true;
            }
        }
        return false;
    }

    public hasArgs(): boolean
    {
        return (this.isParsed && this.args && this.args.size > 0);
    }

    public async fetchMember(username: string): Promise<GuildMember>
    {
        if (this.guild)
        {
            let res: Collection<string, GuildMember> = await this.guild.members.fetch({ query: username, limit: 1});
            if (res.size == 1)
            {
                return res.array()[0];
            }
            else 
            {
                return undefined;
            }
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

    /**
     * Sends a message to the channel if the verbose level is above 1, else sends to the author.
     * @param message Message to send
     */
    public async send(message: string | MessageEmbed): Promise<void>
    {
        if (Config.getVerbose() > 1)
        {
            await this.sendToChannel(message);
        }
        else 
        {
            await this.sendToAuthor(message);
        }
    }

    public async sendToChannel(message: string | MessageEmbed): Promise<void>
    {
        await this._message.channel.send(message);
    }

    public async sendToAuthor(message: string | MessageEmbed): Promise<void>
    {
        await this._message.author.send(message);
    }

    public async delete(timeout: number): Promise<void>
    {
        if (this.message.deletable)
        {
            if (timeout)
            {
                this.message.delete({timeout: timeout});
            }
            else
            {
                this.message.delete();
            }
        }
    }

    public async type(): Promise<void> 
    {
        if (this.textChannel && !this.typing)
        {
            await this.textChannel.startTyping();
        }
    }

    public stopTyping(): void
    {
        if (this.textChannel && this.typing)
        {
            this.textChannel.stopTyping(true);
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