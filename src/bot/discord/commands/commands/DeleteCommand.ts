import readline = require('readline');
import { Bot } from '../../Bot';
import { Message, TextChannel, Collection } from 'discord.js';
import { Printer } from '../../../../console/Printer';
import { ProgressBar } from '../../../../console/effects/ProgressBar';
import { Command } from '../Command';
import { DiscordObjectGetter } from '../../../common/DiscordObjectGetter';
import { MessageWrapper } from '../../../common/MessageWrapper';
import { Tools } from '../../../../helpers/Tools';
import { CommandArgumentError } from '../../../../errors/command_errors/CommandArgumentError';
import { Config } from '../../../../dal/Config';

export class DeleteCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("delete", bot, false);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        let params: Params = this.getParams(wrapper);

        Printer.title("deleting messages");
        Printer.args(
            ["number of messages", "channel name", "target user"],
            [`${params.messages}`, `${params.channel.name}`, `${params.username ? "none" : params.username}`]
        );

        switch (params.action)
        {
            case Action.NORMAL:
            {
                let dog = new DiscordObjectGetter();
                let messages: Array<Message>;
                if (params.username)
                {
                    let username = params.username;
                    if (params.deletePinned)
                    {
                        messages = await dog.fetchAndFilter(
                            params.channel, 
                            params.messages, 
                            (message: Message) => message.author.tag == username, 
                            { maxIterations: 5000, allowOverflow: false }
                        );
                    }
                    else
                    {
                        messages = await dog.fetchAndFilter(
                            params.channel, 
                            params.messages, 
                            (message: Message) => message.author.tag == username && !message.pinned, 
                            { maxIterations: 5000, allowOverflow: false }
                        );
                    }
                    
                }
                else if (!params.deletePinned)
                {
                    messages = await dog.fetchAndFilter(
                        params.channel, 
                        params.messages, 
                        (message: Message) => !message.pinned, 
                        { maxIterations: 5000, allowOverflow: false }
                    );
                }
                else
                {
                    messages = await dog.fetch(params.channel, params.messages, { maxIterations: 5000, allowOverflow: false });
                }
                await this.overrideDelete(messages);

                break;
            }    
            case Action.ARG_LESS:
                this.bulkDelete(params.channel, params.messages);
                break;
            case Action.BY_ID:
            {
                let ids = params.messageIDs;
                let dog = new DiscordObjectGetter();
                let messages = await dog.fetchAndFilter(
                    params.channel, 
                    params.messages, 
                    (message: Message) => ids.indexOf(message.id) != -1, 
                    { maxIterations: 5000, allowOverflow: false }
                );
                await this.overrideDelete(messages);

                break;   
            }
            default:
                break;
        }
    }

    public help(wrapper: MessageWrapper): string
    {
        let opt = wrapper.commandContent;
        if (!Tools.isNullOrEmpty(opt))
        {
            let message = "";
            switch (opt)
            {
                case "n":
                    message = "How many messages you want to delete.";
                    break;
                case "u":
                    message = "Use this option to delete only the messages sent by a specific user. You need to set how many messages you want to delete `-n` option.";
                    break;
                case "p":
                    case "pins":
                        message = "Append this option to delete even pinned messages (by default the bot will not delete pinned messages)."
                        break;
                default:
                    throw new CommandArgumentError(this, "Option not recognized", opt);
            }
            return message;
        }
        else 
        {
            return "When using the command with no options you have two ways of using it. You can use it to delete a number of messages in the current channel by simply giving how many messages you want to delete: `" + Config.getPrefix() + "d 10` will delete 10 messages. Or give a list of message IDs (separated by commas) to delete only those messages (usually you will use this command after having used the CleanChannel command with the preview option `-p`).\n*The bot will not delete pinned messages*";
        }
    }

    private bulkDelete(channel: TextChannel, n: number): void 
    {
        channel.bulkDelete(n)
            .then(response =>
            {
                let bar = new ProgressBar(response.size, "deleting messages");
                bar.start();

                let i = 1;
                response.forEach(() =>
                {
                    bar.update(i);
                    i++;
                });

                bar.stop();
            })
            .catch(async (pastErr) =>
            {
                Printer.error("Bulk delete failed, switching to manual delete.");
                Printer.warn(pastErr.toString());
                let dog = new DiscordObjectGetter();
                try 
                {
                    await this.overrideDelete(await dog.fetch(channel, n, { maxIterations: 5000, allowOverflow: false }));
                }
                catch (e)
                {
                    Printer.error(e.toString());
                }
            });
    }

    /**
     * Deletes messages even if they are too old to be deleted by the Discord API directly.
     * Can be used to delete a specific user messages.
     * @param channel
     * @param params
     */
    private async overrideDelete(messages: Array<Message>): Promise<void>
    {
        let bar = new ProgressBar(messages.length, "deleting messages");
        bar.start();
        
        let alive = true;
        let timeout: NodeJS.Timeout = setTimeout(() =>
        {
            alive = false;
            bar.stop();
            Printer.warn("deleting messages slower than planned, stopping");
        }, 10000);

        for (var i = 0; i < messages.length && alive; i++)
        {
            if (messages[i].deletable)
            {
                await messages[i].delete({ timeout: 100 });
            }

            bar.update(i + 1);
            timeout.refresh();
        }
        clearTimeout(timeout);
        bar.stop();

        Printer.print("");
    }

    private getParams(wrapper: MessageWrapper): Params
    {
        if (wrapper.hasArgs())
        {
            let messages = 1;
        
            if (!Number.isNaN(Number.parseInt(wrapper.get("n"))))
            {
                messages = Number.parseInt(wrapper.get("n")) + 1;
            }

            let username: string = undefined; 
            if (wrapper.get("u"))
            {
                let value = wrapper.getValue(["u", "user", "username"]);
                let res = /([A-Za-z0-9]+#+[0-9999])\w+/.exec(value);

                if (res && res[0] == value)
                {
                    username = wrapper.get("u");
                }
            }

            let channel = this.resolveTextChannel(wrapper);

            let deletePinned = wrapper.hasValue(["pins", "p"]);
            
            return { 
                action: Action.NORMAL,
                messages: messages, 
                channel: channel, 
                username: username, 
                deletePinned: deletePinned 
            };
        }
        else 
        {
            if (wrapper.commandContent.match(/([0-9]+,)+([0-9]+)$/))
            {
                let ids = wrapper.commandContent.split(',');
                let parsedIds = new Array<number>();
                for (let i = 0; i < ids.length; i++)
                {
                    if (!Number.isNaN(Number.parseInt(ids[i])))
                    {
                        parsedIds.push(Number.parseInt(ids[i]));
                    }
                }
                
                return { 
                    action: Action.BY_ID,
                    messages: ids.length, 
                    channel: wrapper.message.channel as TextChannel,
                    deletePinned: false,
                    messageIDs: ids
                };
            }
            else if (!Number.isNaN(Number.parseInt(wrapper.commandContent)))
            {
                let messages = Number.parseInt(wrapper.commandContent) + 1;
                return { 
                    action: Action.ARG_LESS,
                    messages: messages, 
                    channel: wrapper.message.channel as TextChannel,
                    deletePinned: false
                };
            }
        }
    }
}

enum Action 
{
    NORMAL, ARG_LESS, BY_ID, NOT_DEF
}

interface Params
{
    action: Action
    messages: number;
    channel: TextChannel;
    deletePinned: boolean;
    username?: string;
    messageIDs?: Array<string>
}