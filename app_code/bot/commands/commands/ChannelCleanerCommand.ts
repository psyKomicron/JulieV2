import { Command } from "../Command";
import { Message, Channel, TextChannel, Collection, User } from "discord.js";
import { Bot } from "../../Bot";
import { Printer } from "../../../console/Printer";
import { ProgressBar } from "../../../console/effects/ProgressBar";

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
            this.cleanChannel(values[1], values[0], message);
        }
    }

    private async cleanChannel(channel: TextChannel, numberPerUser: number, message: Message): Promise<void>
    {
        let lastDate = new Date(Date.now());
        let messages: Array<Message> = await this.getMessagesBefore(lastDate, channel, message);

        let bar = new ProgressBar(messages.length, "cleaning channel [" + channel.name + "]");
        bar.start();

        // start sorting and selecting messages
        for (var i = 0; i < messages.length; i++)
        {
            let message = messages[i];

            if (!this.hasAnyData(message))
            {
                let messagesByAuthor = new Map<User, number>();
                for (var j = i; j < messages.length; j++)
                {
                    let author = messages[j].author;
                    if (!this.hasAnyData(messages[j]))
                    {
                        if (messagesByAuthor.has(author))
                        {
                            messagesByAuthor.set(author, messagesByAuthor.get(author) + 1);

                            if (messagesByAuthor.get(author) > numberPerUser)
                            {
                                this.deleteMessage(messages[j]);
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
            bar.update(i);
        }
        bar.stop();
    }

    private async getMessagesBefore(date: Date, channel: TextChannel, currentMessage: Message): Promise<Array<Message>>
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
            if (isSameDay(message.createdAt, date) && message != currentMessage)
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
        let urlRegex = /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

        if (message.attachments.size > 0) return true;
        else if (message.cleanContent.match(urlRegex) != undefined) return true;
        else return false;
    }

    private getParams(map: Map<string, string>, message: Message): [number, TextChannel]
    {
        let maxMessages = 3;
        let channel: TextChannel = undefined;

        if (!Number.isNaN(Number.parseInt(map.get("u"))))
        {
            maxMessages = Number.parseInt(map.get("u"));
        }

        let resolvedChannel = this.resolveTextChannel(map, message);

        return [maxMessages, channel];
    }
}