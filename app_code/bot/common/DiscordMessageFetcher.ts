import { TextChannel, Message, Collection } from "discord.js";
import { ArgumentError } from "../../errors/ArgumentError";

export class DiscordMessageFetcher
{
    /**
     * Fetches messages in a channel.
     * @param channel Where to fetch the messages
     * @param messagesAmount Number of messages to fetch
     * @param chunk How much messages to fetch. Can use function instead of constant
     */
    public async fetch(channel: TextChannel, messagesAmount: number, options: AdditionalParams): Promise<Array<Message>>
    {
        this.isChannelNullOrUndefined(channel);

        chunk = chunk ?? 50;

        let messages = await channel.messages.fetch();
        let resMessages: Array<Message> = new Array();
        let nullMessageFilter = (message: Message) => message != undefined;

        messages.filter(nullMessageFilter);

        // add messages to result array
        messages.forEach((message: Message) => resMessages.push(message));

        if (resMessages.length < messagesAmount)
        {
            while (resMessages.length < messagesAmount)
            {
                let lastMessageID = await messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    break;
                }
                else
                {
                    if (typeof chunk == "number")
                    {
                        messages = await channel.messages.fetch({ limit: chunk, before: lastMessageID });
                    }
                    else
                    {
                        messages = await channel.messages.fetch({ limit: chunk(resMessages.length), before: lastMessageID });
                    }

                    // apply not null/undefined filter && user filter
                    messages = messages.filter(nullMessageFilter);

                    messages.forEach((message: Message) => resMessages.push(message));
                }
            }
        }

        if (!overflow)
        {
            return this.slice(resMessages, messagesAmount);
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
            let isIn = false;
            if (ignoreList instanceof Array)
            {
                for (var i = 0; i < ignoreList.length; i++)
                {
                    if (ignoreList[i].id == message.id)
                    {
                        return true;
                    }
                }
            }
            else if (ignoreList)
            {
                return ignoreList.id == message.id;
            }

            return message != undefined
                && (message.createdAt.getFullYear() == date.getFullYear()
                    && message.createdAt.getMonth() == date.getMonth()
                    && message.createdAt.getDate() == date.getDate()
                    && message.createdAt.getDay() == date.getDay())
                && isIn;
        }

        let messages: Array<Message> = await this.fetchAndFilter(channel, 100, filter, undefined, true, ignoreList, date);

        return messages.sort((a: Message, b: Message) =>
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
     * @param chunk Optional parameter to set the number of messages to get each loop if the initial fetch was too small (limit)
     * @param overflow If set to true the collection size may be bigger than messagesAmount, if left on false the collection
     * will be trimmed
     * @param args Args to provide to the filter function (if needed)
     */
    public async fetchAndFilter(channel: TextChannel, messagesAmount: number, filter: Filter, options: AdditionalParams, ...args: any[]): Promise<Array<Message>>
    {
        this.isChannelNullOrUndefined(channel);

        let messages = await channel.messages.fetch();
        let resMessages: Array<Message> = new Array();

        let nullMessageFilter = (message: Message) => message != undefined;
        // adding to resMessages and removing null/undefined messages
        messages = messages.filter(nullMessageFilter);

        messages = messages.filter((message: Message) =>
        {
            return filter(message, args);
        });

        // add messages to result array
        messages.forEach((message: Message) => resMessages.push(message));

        if (resMessages.length < messagesAmount)
        {
            // get more messages manually
            while (resMessages.length < messagesAmount)
            {
                let lastMessageID = await messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    break;
                }
                else
                {
                    messages = await channel.messages.fetch(
                        {
                            limit: typeof options.chunk == "function" ? options.chunk(resMessages.length) : options.chunk,
                            before: lastMessageID
                        });

                    // apply not null/undefined filter && user filter
                    messages = messages.filter((message: Message) =>
                    {
                        return nullMessageFilter(message) && filter(message, args);
                    });

                    messages.forEach((message: Message) => resMessages.push(message));
                }
            }
        }

        if (!options.overflow)
        {
            return this.slice(resMessages, messagesAmount);
        }

        return resMessages;
    }

    public async fetchAt(channel: TextChannel, date: Date, options: AdditionalParams): Promise<Array<Message>>
    {
        let filter: Filter = (message: Message, date: Date) =>
        {
            return message.createdAt == date;
        }
    }

    private isChannelNullOrUndefined(channel: TextChannel)
    {
        if (!channel)
        {
            throw new ArgumentError("Channel cannot be null/undefined in order to fetch messages", "channel");
        }
    }

    private slice<T>(array: Array<T>, end: number, start: number = 0)
    {
        return array.slice(start, end);
    }
}

type Filter = (message: Message, ...args: any[]) => boolean;
type Chunk = (i: number) => number | number;

interface AdditionalParams
{
    chunk?: Chunk;
    overflow?: number;
}