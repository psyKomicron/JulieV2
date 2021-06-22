import { EventEmitter } from "events";
import { TextChannel, GuildChannel, GuildChannelManager, MessageEmbed } from 'discord.js';
import { Bot } from "../Bot";
import { MessageWrapper } from "../../common/MessageWrapper";

export abstract class Command extends EventEmitter
{
    private static _commands: number = 0;
    private readonly _bot: Bot;
    private readonly _deleteAfterExecution: boolean;
    private readonly _name: string;

    protected constructor(name: string, bot: Bot, deleteAfterExecution: boolean = true)
    {
        super();
        Command._commands++;
        this._bot = bot;
        this._name = name;
        this._deleteAfterExecution = deleteAfterExecution;
    }

    public static get commands(): number { return this._commands; }

    public get name(): string { return this._name; }
    public get deleteAfterExecution(): boolean { return this._deleteAfterExecution; }
    public get bot(): Bot { return this._bot; }

    /** Execute the command async */
    public abstract execute(wrapper: MessageWrapper): Promise<void>;
    /** Help (for the different options for this command) */
    public abstract help(wrapper: MessageWrapper): string;

    /**
     * Resolve a text channel through the Discord API. Returns the channel in wich the message
     * was sent if the channel cannot be resolved.
     * @param args
     * @param message
     */
    public resolveTextChannel(wrapper: MessageWrapper): TextChannel
    {
        if (wrapper.args)
        {
            return this.resolveFromID(wrapper.args.get("c"), wrapper.message.guild.channels)
                ?? this.resolveFromID(wrapper.args.get("channel"), wrapper.message.guild.channels)
                ?? wrapper.message.channel as TextChannel;
        }
        else 
        {
            return wrapper.message.channel as TextChannel;
        }
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

    /**
     * Iterates through the string to get the command name from a message received by the bot
     * Will stop if the message is too long
     * @param content
     */
     public static getCommandName(content: string): string
     {
         let substr = 0;
         let name = "";
         // replace with a regex
         while (substr < 100 && substr < content.length && content[substr] != "-" && content[substr] != " ")
         {
             name += content[substr];
             substr++;
         }
         return name;
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
}

export interface CommandEvents
{
    end: [void]
}