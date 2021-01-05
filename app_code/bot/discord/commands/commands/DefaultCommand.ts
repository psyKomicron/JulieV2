import { Bot } from '../../Bot';
import { Message } from 'discord.js';
import { Printer } from '../../../../console/Printer';
import { Command } from '../Command';

export class DefaultCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("default", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        Printer.title("default");
        message.reply("Unknown command !");
    }
}