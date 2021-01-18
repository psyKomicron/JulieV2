import { Command } from "../Command";
import { Message, TextChannel } from "discord.js";
import { Bot } from "../../Bot";

/**Asks the TwitterBot to collect images from a channel.*/
export class CollectCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("collect-command", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        if (message.channel instanceof TextChannel)
        {
            this.bot.emit("collect", message.channel, false);
        }
        else
        {
            this.bot.emit("collect", undefined, false);
        }
    }
}