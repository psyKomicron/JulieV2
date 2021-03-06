import { EventEmitter } from "events";
import { FileSystem as fs } from "../../../dal/FileSystem";
import { Message, TextChannel, GuildChannel, GuildChannelManager } from 'discord.js';
import { CommandSyntaxError } from "../../../errors/command_errors/CommandSyntaxError";
import { Printer } from "../../../console/Printer";
import { Bot } from "../Bot";
import { ArgumentError } from "../../../errors/ArgumentError";
import { MessageWrapper } from "../../common/MessageWrapper";

export abstract class Command extends EventEmitter
{
    private static _commands: number = 0;
    private readonly _bot: Bot;
    private readonly _deleteAfterExecution: boolean;
    private readonly _name: string;

    public static get commands(): number { return this._commands; }

    public get name(): string { return this._name; }
    public get deleteAfterExecution(): boolean { return this._deleteAfterExecution; }

    protected get bot(): Bot { return this._bot; }

    protected constructor(name: string, bot: Bot, deleteAfterExecution: boolean = true)
    {
        super();
        Command._commands++;
        this._bot = bot;
        this._name = name;
        this._deleteAfterExecution = deleteAfterExecution;
    }

    /**Execute the command async */
    public abstract async execute(wrapper: MessageWrapper): Promise<void>;

    /**Delete the command message (here to avoid code redundancy) */
    public deleteMessage(message: Message, timeout: number = 100): void
    {
        if (message && message.deletable)
        {
            message.delete({ timeout: timeout })
                .catch(error =>
                {
                    Printer.error("Message could not be deleted");
                    Printer.error(error.toString());
                });
        }
    }

    /**
     * Resolve a text channel through the Discord API. Returns the channel in wich the message
     * was sent if the channel cannot be resolved.
     * @param args
     * @param message
     */
    public resolveTextChannel(args: Map<string, string>, message: Message): TextChannel
    {
        return this.resolveFromID(args.get("c"), message.guild.channels)
            ?? this.resolveFromID(args.get("channel"), message.guild.channels)
            ?? message.channel as TextChannel;
    }

    /**
     * Resolve a channel (text, voice, category, news, store) through the Discord API.
     * Returns undefined if the id isn't recognized.
     * @param channelID string | Discord.Snowflake representing a Channel id.
     * @returns The resolved GuildChannel.
     */
    public resolveChannel(channelID: string, manager: GuildChannelManager): GuildChannel
    {
        let channel: GuildChannel;
        let resolvedChannel = manager.resolve(channelID);
        if (resolvedChannel)
        {
            channel = resolvedChannel;
        }
        return channel;
    }

    //#region events
    public on<K extends keyof CommandEvents>(event: K, listener: (...args: CommandEvents[K]) => void): this
    {
        return super.on(event, listener);
    }

    public emit<K extends keyof CommandEvents>(event: K, ...args: CommandEvents[K]): boolean
    {
        return super.emit(event, ...args);
    }
    //#endregion

    private resolveFromID(channelID: string, manager: GuildChannelManager): TextChannel
    {
        let channel: TextChannel;
        let resolvedChannel = manager.resolve(channelID);
        if (resolvedChannel && resolvedChannel instanceof TextChannel)
        {
            channel = resolvedChannel;
        }
        return channel;
    }

    private async writeLogs(wrapper: MessageWrapper): Promise<void>
    {
        const map = wrapper.args;
        const filepath = "./files/logs/";
        const name = "command_logs";
        fs.mkdir(filepath, true);
        if (!fs.exists(filepath + name + ".json"))
        {
            let root = [];
            fs.writeFile(filepath + name + ".json", JSON.stringify(root));
        }
        var logs = JSON.parse(fs.readFile(filepath + name + ".json").toString());
        let now = new Date(Date.now());
        let data = {};
        map.forEach((value, key) =>
        {
            data[key] = value;
        });
        var json = {
            "user": [
                {
                    "username": wrapper.message.author.username,
                    "discriminator": wrapper.message.author.discriminator
                }
            ],
            "command": [
                {
                    "name": this._name,
                    "arguments": data,
                    "command number": `${Command.commands}`,
                    "message id": `${wrapper.message.id}`,
                    "message": wrapper
                }
            ],
            "date": [
                {
                    "day": now.getDate(),
                    "month": now.getMonth(),
                    "year": now.getFullYear(),
                    "epoch": Date.now()
                }
            ]
        }
        if (fs.getStats(filepath + name + ".json").size > 19000)
        {
            let index = 1;
            while (fs.exists(`${filepath}${name}(${index})`)) index++;
            fs.writeFile(`${filepath}${name}(${index}).json`, JSON.stringify(json));
        }
        else
        {
            logs.push(json);
            fs.writeFile(filepath + name + ".json", JSON.stringify(logs));
        }
    }
}

export interface CommandEvents
{
    end: [void]
}