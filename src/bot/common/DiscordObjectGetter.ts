import { TextChannel, Message } from "discord.js";
import EventEmitter from "events";
import { ArgumentError } from "../../errors/ArgumentError";
import { Tools } from "../../helpers/Tools";

type Filter = (message: Message, ...args: any[]) => boolean;
type Chunk = (i: number) => number | number;

interface AdditionalParams
{
    maxIterations: number;
    chunk?: Chunk;
    allowOverflow?: boolean;
}

interface DOGEvent 
{
    progress: [number]
}

export class DiscordObjectGetter extends EventEmitter
{
    public readonly DEFAULT_CHUNK_VALUE = 50;

    /**
     * Fetches messages in a channel.
     * @param channel Where to fetch the messages
     * @param messagesAmount Number of messages to fetch
     * @param chunk How much messages to fetch. Can use function instead of constant
     */
    public async fetch(channel: TextChannel, messagesAmount: number, options: AdditionalParams): Promise<Array<Message>>
    {
        this.isChannelNullOrUndefined(channel);

        let messages = await channel.messages.fetch();
        let resMessages: Array<Message> = new Array();
        let nullMessageFilter = (message: Message) => message != undefined;

        messages = messages.filter(nullMessageFilter);

        // add messages to result array
        messages.forEach((message: Message) => resMessages.push(message));

        if (resMessages.length < messagesAmount)
        {
            var i = 0;
            while (resMessages.length < messagesAmount && i < options.maxIterations)
            {
                let lastMessageID = messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    break;
                }
                else
                {
                    messages = await channel.messages.fetch({ limit: this.getChunk(options?.chunk, i), before: lastMessageID });

                    // apply not null/undefined filter
                    messages.filter(nullMessageFilter)
                            .forEach((message: Message) => resMessages.push(message));
                    this.emit("progress", resMessages.length);
                }
                i++;
            }
        }

        if (!options?.allowOverflow)
        {
            return Tools.slice(resMessages, messagesAmount);
        }

        return resMessages;
    }

    /**
     * Fetches messages in the channel that were created/sent the same day as the date parameter. 
     * An ignore list can be provided (i.e. to ignore the last message in the channel), the number
     * of messages is directly limited by the Discord API, too old dates will cause an error.
     * @param date When to get messages
     * @param ignoreList Messages or message to ignore
     * @param compareFunction Sort to apply to the retreived messages
     */
    public async fetchToday(channel: TextChannel, ignoreList?: Array<Message> | Message): Promise<Array<Message>>
    {
        this.isChannelNullOrUndefined(channel);

        let date: Date = new Date(Date.now());

        var filter: Filter = (message: Message, ignoreList: Array<Message> | Message, date: Date) =>
        {
            if (ignoreList instanceof Array)
            {
                for (var i = 0; i < ignoreList.length; i++)
                {
                    if (ignoreList[i].id == message.id)
                    {
                        return false;
                    }
                }
            }
            else if (ignoreList && (ignoreList.id == message.id))
            {
                return false;
            }

            return message.createdAt != undefined
                && Tools.isSameDay(message.createdAt, date);
        }

        let alive = true;
        let messages = await channel.messages.fetch();
        let filteredMessages: Array<Message> = new Array();

        let nullMessageFilter = (message: Message) => message != undefined;
        // adding to resMessages and removing null/undefined messages
        messages = messages.filter(nullMessageFilter);

        messages.forEach(message => 
        {
            if (filter(message, ignoreList, date))
            {
                filteredMessages.push(message);
            }
            if (message.createdAt && !Tools.isSameDay(message.createdAt, date))
            {
                alive = false;
            }
        });
        if (alive)
        {
            // get more messages manually
            let iterations = 0;
            while (alive && iterations < 5000)
            {
                let lastMessageID = messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    break;
                }
                else
                {
                    messages = await channel.messages.fetch(
                    {
                        limit: 100,
                        before: lastMessageID
                    });

                    // apply not null/undefined filter && 'today' filter
                    messages.forEach((message: Message) => 
                    {
                        if (nullMessageFilter(message) && filter(message, ignoreList, date))
                        {
                            filteredMessages.push(message);
                        }
                    });
                }
            }
        }

        // sort by date
        return filteredMessages.sort((a: Message, b: Message) =>
        {
            if (a.createdAt.getTime() == b.createdAt.getTime())
            {
                return 0;
            }
            else if (a.createdAt.getTime() > b.createdAt.getTime())
            {
                return 1;
            }
            else
            {
                return -1;
            }
        });
    }

    /**
     * Fetches messages in a channel and filter them according to the @param filter. In addition to the filter every
     * null message fetched is filtered out too.
     * @param channel Channel to collect the messages from
     * @param messagesAmount Number of messages to collect
     * @param filter Filter function to apply to the collection (null/undefined messages will be removed automatically)
     * @param options Function options (chunk, max messages, overflow).
     * @param args Args to provide to the filter function (if needed)
     * @returns 
     */
    public async fetchAndFilter(channel: TextChannel, messagesAmount: number, filter: Filter, options: AdditionalParams, ...args: any[]): Promise<Array<Message>>
    {
        this.isChannelNullOrUndefined(channel);

        let messages = await channel.messages.fetch();
        let filteredMessages: Array<Message> = new Array();

        let nullMessageFilter = (message: Message) => message != undefined;
        // adding to resMessages and removing null/undefined messages
        messages = messages.filter(nullMessageFilter);

        messages.forEach(value => 
        {
            if (filter(value, ...args))
            {
                filteredMessages.push(value);
            }
        });

        if (filteredMessages.length < messagesAmount)
        {
            let iterations = 0;
            // get more messages manually
            while (filteredMessages.length < messagesAmount && iterations < options.maxIterations)
            {
                let lastMessageID = messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    break;
                }
                else
                {
                    messages = await channel.messages.fetch(
                    {
                        limit: this.getChunk(options.chunk, filteredMessages.length),
                        before: lastMessageID
                    });

                    // apply not null/undefined filter && user filter
                    messages.forEach(value => 
                    {
                        if (nullMessageFilter(value) && filter(value, ...args))
                        {
                            filteredMessages.push(value);
                        }
                    });
                }
                iterations++;
            }
        }

        if (!options.allowOverflow)
        {
            return Tools.slice(filteredMessages, messagesAmount);
        }

        return filteredMessages;
    }

    public on<K extends keyof DOGEvent>(event: K, listener: (...args: DOGEvent[K]) => void): this
    {
        return super.on(event, listener);
    }

    public emit<K extends keyof DOGEvent>(event: K, ...args: DOGEvent[K]): boolean
    {
        return super.emit(event, ...args);
    }

    private isChannelNullOrUndefined(channel: TextChannel)
    {
        if (!channel)
        {
            throw new ArgumentError("Channel cannot be null/undefined in order to fetch messages", "channel");
        }
    }

    private getChunk(chunk: Chunk, iterator: number): number
    {
        if (!chunk) 
        {
            return this.DEFAULT_CHUNK_VALUE;
        }
        else 
        {
            return typeof chunk == "function" ? Math.round(chunk(iterator) * 100) : chunk;
        }
    }
}