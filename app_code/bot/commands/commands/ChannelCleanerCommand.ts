import { Command } from "../Command";
import { Message, Channel, TextChannel, Collection, User } from "discord.js";
import { Bot } from "../../Bot";
import { Printer } from "../../../console/Printer";

export class ChannelCleanerCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("channel cleaner", bot, true);
    }

    public async execute(message: Message): Promise<void>
    {
        let values = this.getParams(this.parseMessage(message), message);
        Printer.title("cleaning channel");
        if (values[1] != undefined)
        {
            Printer.args(["number of unique messages", "channel"], [`${values[0]}`, `${values[1].name}`]);
            this.cleanChannel(values[1], values[0]);
        }
    }

    private async cleanChannel(channel: TextChannel, numberPerUser: number): Promise<boolean>
    {
        let lastDate = new Date(Date.now());
        let done = true;
        let messages: Array<Message> = await this.getMessagesBefore(lastDate, channel);

        // start sorting and selecting messages
        for (var i = 0; i < messages.length; i++)
        {
            let message = messages[i];

            if (!this.hasAnyData(message))
            {
                let messagesByAuthor = new Map<User, number>();
                for (var j = i + 1; j < messages.length; j++)
                {
                    let author = messages[j].author;
                    console.log(author.username);
                    if (!this.hasAnyData(messages[j]))
                    {
                        if (messagesByAuthor.has(author))
                        {
                            messagesByAuthor.set(author, messagesByAuthor.get(author) + 1);

                            if (messagesByAuthor.get(author) > numberPerUser)
                            {
                                // this.deleteMessage(messages[j]);
                                Printer.info(messages[j].toString());
                            }
                        }
                        else
                        {
                            messagesByAuthor.set(author, 1);
                        }
                    }
                    else
                    {
                        break;
                    }
                }
                i = j;
            }
        }

        return done;
    }

    private async getMessagesBefore(date: Date, channel: TextChannel): Promise<Array<Message>>
    {
        let messagesToHandle: Array<Message> = new Array();
        let messages: Collection<string, Message> = await channel.messages.fetch();

        let isSameDay = (messageDate: Date, date: Date) =>
        {
            return messageDate.getFullYear() == date.getFullYear()
                && messageDate.getMonth() == date.getMonth()
                && messageDate.getDate() == date.getDate()
                && messageDate.getDay() == date.getDay();
        };

        messages.forEach((message) =>
        {
            if (isSameDay(message.createdAt, date))
            {
                messagesToHandle.push(message);
            }
        });

        return messagesToHandle.sort((a: Message, b: Message) =>
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

    private hasAnyData(message: Message): boolean
    {
        let has: boolean = true;
        let urlRegex = /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

        if (message.attachments.size > 0) return true;
        else if (message.cleanContent.length > 10 && message.cleanContent.match(urlRegex) != undefined) return true;
        else return false;
    }

    private getParams(map: Map<string, string>, message: Message): [number, TextChannel]
    {
        let maxMessages = 3;
        let channel: TextChannel = message.channel instanceof TextChannel ? message.channel : undefined;
        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "u":
                    if (!Number.isNaN(Number.parseInt(value)))
                    {
                        maxMessages = Number.parseInt(value);
                    }
                    break;
                case "c":
                    let resolvedChannel = this.resolveTextChannel(value, message.guild.channels);
                    if (resolvedChannel)
                    {
                        channel = resolvedChannel;
                    }
                    break;
            }
        });
        return [maxMessages, channel];
    }
}