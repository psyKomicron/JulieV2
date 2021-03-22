import { Command } from "../Command";
import { Message, Channel, TextChannel, Collection, User } from "discord.js";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { ProgressBar } from "../../../../console/effects/ProgressBar";
import { DiscordMessageFetcher } from "../../../common/DiscordMessageFetcher";
import { MessageWrapper } from "../../../common/MessageWrapper";

export class ChannelCleanerCommand extends Command
{
    private dog: DiscordMessageFetcher = new DiscordMessageFetcher();

    public constructor(bot: Bot)
    {
        super("channel-cleaner", bot, true);
    }

    public async execute(message: MessageWrapper): Promise<void>
    {
        let values = this.getParams(message);
        Printer.title("cleaning channel");
        if (values[1] != undefined)
        {
            Printer.args(["number of unique messages", "channel"], [`${values[0]}`, `${values[1].name}`]);
            this.cleanChannel(values[1], values[0], message.message);
        }
    }

    private async cleanChannel(channel: TextChannel, numberPerUser: number, message: Message): Promise<void>
    {
        let messages: Array<Message> = await this.dog.fetchToday(channel, message);

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

    private hasAnyData(message: Message): boolean
    {
        let urlRegex = /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

        if (message.attachments.size > 0) return true;
        else if (message.cleanContent.match(urlRegex) != undefined) return true;
        else return false;
    }

    private getParams(wrapper: MessageWrapper): [number, TextChannel]
    {
        let maxMessages = 3;
        let channel: TextChannel = undefined;

        if (!Number.isNaN(Number.parseInt(wrapper.get("u"))))
        {
            maxMessages = Number.parseInt(wrapper.get("u"));
        }

        channel = this.resolveTextChannel(wrapper);

        return [maxMessages, channel];
    }
}