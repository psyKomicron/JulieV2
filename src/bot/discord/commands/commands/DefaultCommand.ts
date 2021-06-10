import { Bot } from '../../Bot';
import { LogLevels, Printer } from '../../../../console/Printer';
import { Command } from '../Command';
import { MessageWrapper } from '../../../common/MessageWrapper';

export class DefaultCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("default", bot);
    }

    public async execute(message: MessageWrapper): Promise<void> 
    {
        Printer.title("default");
        Printer.writeLog("unknown command used (message: " + message.content + ")\n", LogLevels.Log);
        message.reply("Unknown command !");
    }
}