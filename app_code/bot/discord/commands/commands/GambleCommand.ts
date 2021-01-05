import { Command } from '../Command';
import { Message } from "discord.js";
import { Bot } from "../../Bot";

export class GambleCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("gamble-command", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        let params: Params = this.getParams(this.parseMessage(message));

    }

    private getParams(args: Map<string, string>)
    {

        return null;
    }
}

interface Params
{

}
