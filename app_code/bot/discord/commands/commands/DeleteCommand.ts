import readline = require('readline');
import { Bot } from '../../Bot';
import { Message, TextChannel, Collection } from 'discord.js';
import { Printer } from '../../../../console/Printer';
import { ProgressBar } from '../../../../console/effects/ProgressBar';
import { Command } from '../Command';
import { DiscordMessageFetcher } from '../../../common/DiscordMessageFetcher';
import { MessageWrapper } from '../../../common/MessageWrapper';

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

        if (params.channel != undefined && !params.username) // bulk delete
        {
            Printer.args(
                ["number of messages", "channel name", "target user"],
                [`${params.messages}`, `${params.channel.name}`, `${params.username ? "none" : params.username}`]);

            let channel: TextChannel = params.channel;

            channel.bulkDelete(params.messages)
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
                .catch(() =>
                {
                    this.overrideDelete(channel, params)
                        .catch(error =>
                        {
                            Printer.error("Bulk delete failed, switching to manual delete.");
                            Printer.error(error.toString());
                        });
                });
        }
        // channel defined && username filled (username validation done before)
        else if (params.channel != undefined && params.username) // target delete
        {
            Printer.args(
                ["number of messages", "channel name", "method", "target user"],
                [`${params.messages}`, `${params.channel.name}`, "target delete", `${params.username}`]);

            this.overrideDelete(params.channel, params);
        }
    }

    /**
     * Deletes messages even if they are too old to be deleted by the Discord API directly.
     * Can be used to delete a specific user messages.
     * @param channel
     * @param params
     */
    private async overrideDelete(channel: TextChannel, params: Params): Promise<void>
    {
        let messages: Array<Message>;
        let dog = new DiscordMessageFetcher();

        if (params.username)
        {
            let username = params.username;

            let filter: (message: Message) => boolean;

            if (params.deletePinned)
            {
                filter = (message: Message) => message.author.tag == username;
            }
            else
            {
                filter = (message: Message) => message.author.tag == username && !message.pinned;
            }

            messages = await dog.fetchAndFilter(channel, params.messages, filter, { overflow: false });
        }
        else if (!params.deletePinned)
        {
            messages = await dog.fetchAndFilter(channel, params.messages, (message: Message) => !message.pinned, { overflow: false });
        }
        else
        {
            messages = await dog.fetch(channel, params.messages, { overflow: false });
        }

        let bar = new ProgressBar(params.messages, "deleting messages");
        bar.start();
        
        let alive = true;
        let timeout: NodeJS.Timeout = setTimeout(() =>
        {
            alive = false;
            //readline.moveCursor(process.stdout, 64, -2);
            bar.stop();
            Printer.warn("deleting messages slower than planned, stopping");
            //readline.moveCursor(process.stdout, 0, 1);
        }, 10000);

        for (var i = 0; i < messages.length && i < params.messages && alive; i++)
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
        let messages = 10;
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

        let channel = this.resolveTextChannel(wrapper.args, wrapper.message);

        let deletePinned = wrapper.hasValue(["pins", "p"]);
        
        return { messages, channel, username, deletePinned };
    }
}

interface Params
{
    messages: number;
    channel: TextChannel;
    username?: string;
    deletePinned: boolean;
}