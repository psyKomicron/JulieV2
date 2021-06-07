import { Command } from "../Command";
import { Message, TextChannel, User, EmbedField } from "discord.js";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { ProgressBar } from "../../../../console/effects/ProgressBar";
import { DiscordObjectGetter } from "../../../common/DiscordObjectGetter";
import { MessageWrapper } from "../../../common/MessageWrapper";
import { CommandSyntaxError } from "../../../../errors/command_errors/CommandSyntaxError";
import { EmojiReader } from "../../../../dal/readers/EmojiReader";
import { Tools } from "../../../../helpers/Tools";
import { EmbedFactory } from "../../../../factories/EmbedFactory";

/**
 * @command-syntax clean
 */
export class CleanChannelCommand extends Command
{
    private dog: DiscordObjectGetter = new DiscordObjectGetter();

    public constructor(bot: Bot)
    {
        super("channel-cleaner", bot, false);
    }

    public async execute(message: MessageWrapper): Promise<void>
    {
        let values = this.getParams(message);
        Printer.title("cleaning channel");
        if (values[1] != undefined)
        {
            Printer.args(["number of unique messages", "channel"], [`${values[0]}`, `${values[1].name}`]);
            await this.cleanChannel(message, values[0], values[1], values[2], values[3]);
        }
        else
        {
            throw new CommandSyntaxError(this, "Missing number per user argument (u)");
        }

    }

    private async cleanChannel(message: MessageWrapper, numberPerUser: number, channel: TextChannel, onlyToday: boolean,
        preview: boolean): Promise<void>
    {
        let messages: Array<Message>;
        if (onlyToday)
        {
            messages = await this.dog.fetchToday(channel, message.message);
        }
        else 
        {
            messages = await this.dog.fetch(channel, 100, {maxIterations: 500, chunk: Tools.sigmoid, allowOverflow: false});
        }
        
        if (messages.length == 0)
        {   
            message.react(EmojiReader.getEmoji("warning"));
            Printer.print("No messages found !");
        }
        else 
        {
            let toDelete = new Array<Message>();

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

                                if (messagesByAuthor.get(author) > numberPerUser && messages[j].deletable)
                                {
                                    toDelete.push(messages[j]);
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

            if (preview)
            {
                let embed = EmbedFactory.build({
                    title: "Clean command preview",
                    description: "List of messages that will be deleted"
                });
                let embedField = { name: "Messages", value: "", inline: false }
                for (i = 0; i < toDelete.length; i++)
                {
                    const shorten = Printer.shorten(toDelete[i].cleanContent) + "\n";
                    if (embedField.value.length + shorten.length > 1024)
                    {
                        embed.fields.push(embedField);
                        embedField = { name: "-", value: shorten, inline: false };
                    }
                    else 
                    {
                        embedField.value += shorten;
                    }
                }

                message.sendToChannel(embed);
            }
            else 
            {
                for (i = 0; i < toDelete.length; i++)
                {
                    messages[i].delete({timeout: 100, reason: "Cleaned from channel by bot."})
                        .catch(error => Printer.error(error.toString()));
                }
            }
        }
    }

    private hasAnyData(message: Message): boolean
    {
        let urlRegex = /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

        if (message.attachments.size > 0) return true;
        else if (message.cleanContent.match(urlRegex) != undefined) return true;
        else return false;
    }

    private getParams(wrapper: MessageWrapper): [number, TextChannel, boolean, boolean]
    {
        let maxMessages = 3;
        let channel: TextChannel = undefined;

        if (!Number.isNaN(Number.parseInt(wrapper.get("u"))))
        {
            maxMessages = Number.parseInt(wrapper.get("u"));
        }

        channel = this.resolveTextChannel(wrapper);

        return [maxMessages, channel, !wrapper.hasKeys(["a", "all"]), wrapper.has("p")];
    }
}