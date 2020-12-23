import { Bot } from '../../Bot';
import { Command } from "../Command";
import { Message } from 'discord.js';

export class TestCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("Test command", bot);
    }

    public async execute(message: Message): Promise<void>
    {
        let args = this.parseMessage(message);
        args.forEach((v, k) =>
        {
            console.log(`{"${k}": "${v}"}`);
        });

        this.sendTestCommands(message);
    }

    private sendTestCommands(message: Message): void
    {
        let commands = [
            "/download -n 10",
            "/delete -n 2",
            "/delete -n 2 -u",
            "/embed",
            "/explore -k \"discord\" -wiki",
            "/explore -k \"discord\" -yt",
            "/play -u \"https://www.youtube.com/watch?v=aIHF7u9Wwiw \"",
            "/help",
            "/vote -r \"Test\"",
            "/default"
        ];

        let reply = "";
        commands.forEach(v => reply += v + "\n");

        message.author.send(commands);
    }
}