import { Bot } from '../../Bot';
import { LogLevels, Printer } from '../../../../console/Printer';
import { Command } from '../Command';
import { MessageWrapper } from '../../../common/MessageWrapper';
import { Config } from "../../../../dal/Config";

export class DefaultCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("default", bot);
    }

    public async execute(message: MessageWrapper): Promise<void> 
    {
        Printer.title("default");
        Printer.writeLog("Unknown command used (message: " + message.content + ")", LogLevels.Warning);
        message.reply("Unknown command! Use " + Config.getPrefix() + "help to get the list of available commands.");
    }
}