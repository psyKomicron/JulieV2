import { Bot } from '../../Bot';
import { Command } from '../Command';
import { Message } from 'discord.js';
import { MessageWrapper } from '../../../common/MessageWrapper';

export class TestCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("Test command", bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void>
    {
        let args = wrapper.args;
        args.forEach((v, k) =>
        {
            console.log(`{"${k}": "${v}"}`);
        });

        wrapper.send(this.getTestCommands());
    }

    private getTestCommands(): string
    {
        return "```\n/download -n 10\n" + 
            "/delete -n 2\n" + 
            "/delete -n 2 -u\n" + 
            "/embed\n" + 
            "/explore -k \"discord\" -wiki\n/explore -k \"discord\" -yt\n" + 
            "/play -u \"https://www.youtube.com/watch?v=aIHF7u9Wwiw \"\n" +
            "/help" +
            "/vote -r \"Test\"" +
            "/default\n```";
    }
}