import { Bot } from '../../Bot';
import { Printer } from '../../../../console/Printer';
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
        message.reply("Unknown command !");
    }
}