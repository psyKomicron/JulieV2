import readline = require('readline');
import { Bot } from '../../Bot';
import { Message, TextChannel, Collection } from 'discord.js';
import { Printer } from '../../../../console/Printer';
import { ProgressBar } from '../../../../console/effects/ProgressBar';
import { Command } from '../Command';
import { DiscordMessageFetcher } from '../../../common/DiscordMessageFetcher';

export class DeleteCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("delete", bot, false);
    }

    public async execute(message: Message): Promise<void> 
    {
        let params: Params = this.getParams(this.parseMessage(message), message);

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

            let channel = params[1];
            this.overrideDelete(channel, params);
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
            let filter = params.deletePinned ? (message: Message) => message.author.tag == username;
            messages = await dog.fetchAndFilter(channel, params.messages, filter);
        }
        else
        {
            messages = await dog.fetch(channel, params.messages);
        }

        let bar = new ProgressBar(params[0], "deleting messages");
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

        for (var i = 0; i < messages.length && i < params[0] && alive; i++)
        {
            if (messages[i].deletable && !messages[i].pinned)
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

    private getParams(map: Map<string, string>, message: Message): Params
    {
        let messages = 10;
        if (!Number.isNaN(Number.parseInt(map.get("n"))))
        {
            messages = Number.parseInt(map.get("n"));
        }

        let username: string = undefined; 
        if (map.get("u"))
        {
            let value = this.getValue(map, ["u", "user", "username"]);
            let res = /([A-Za-z0-9]+#+[0-9999])\w+/.exec(value);

            if (res && res[0] == value)
            {
                username = map.get("u");
            }
        }

        let channel = this.resolveTextChannel(map, message);

        let deletePinned = map.has("pins") || ;//this.getValue(map, ["pins", "deletePins", "p"]);
        
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