import readline = require('readline');
import { Bot } from '../../Bot';
import { Command } from "../Command";
import { Message, TextChannel, Collection } from 'discord.js';
import { Printer } from '../../../console/Printer';
import { ProgressBar } from '../../../console/effects/ProgressBar';

export class DeleteCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("delete", bot);
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
                        .catch(console.error);
                });
        }
        // channel defined && username filled (username validation done before)
        else if (params.channel != undefined && params.username) // target delete
        {
            console.log(Printer.args(
                ["number of messages", "channel name", "method", "target user"],
                [`${params.messages}`, `${params.channel.name}`, "target delete", `${params.username}`]));

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
        let messages: Collection<string, Message> = await channel.messages.fetch();

        let userFilterFunction = (message: Message, username: string) => message.author.tag == username;
        let messageFilterFunction = (message: Message, collection: Array<Message>) =>
        {
            if (message)
            {
                collection.push(message);
            }
        };

        if (params.username)
        {
            messages = messages.filter(message => userFilterFunction(message, params.username));
        }

        let messagesToDelete: Array<Message> = new Array();
        messages.forEach(message => messageFilterFunction(message, messagesToDelete));

        while (messagesToDelete.length < params.messages) 
        {
            let lastMessageID = await messages.last()?.id;
            if (lastMessageID == undefined)
            {
                Printer.warn("not more messages to parse, breaking");
                break;
            }
            else
            {
                messages = await channel.messages.fetch({ limit: 50, before: lastMessageID });
                if (params.username)
                {
                    messages = messages.filter((message) => userFilterFunction(message, params.username));
                }
                messages.forEach(message => messageFilterFunction(message, messagesToDelete));
            }
        }

        let bar = new ProgressBar(params[0], "deleting messages");
        bar.start();
        let alive = true;
        let timeout: NodeJS.Timeout = setTimeout(() =>
        {
            alive = false;
            readline.moveCursor(process.stdout, 64, -2);
            Printer.warn("deleting messages slower than planned, stopping");
            readline.moveCursor(process.stdout, 0, 1);
        }, 10000);

        for (let i = 0; i < messages.size && i < params[0] && alive; i++)
        {
            if (messagesToDelete[i].deletable)
            {
                await messagesToDelete[i].delete({ timeout: 100 });
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
            let res = /([A-Za-z0-9]+#+[0-9999])\w+/.exec(map.get("u"));
            if (res && res[0] == map.get("u"))
            {
                username = map.get("u");
            }
        }

        let channel = this.resolveDefaultTextChannel(map, message);
        
        return { messages, channel, username };
    }
}

interface Params
{
    messages: number;
    channel: TextChannel;
    username?: string;
}