import { Bot } from '../../Bot';
import { Command } from '../Command';
import { Message } from 'discord.js';
import { MessageWrapper } from '../../../common/MessageWrapper';
import { ArgumentError } from "../../../../errors/ArgumentError";
import { ExecutionError } from "../../../../errors/ExecutionError";
import { CommandError } from "../../../../errors/command_errors/CommandError";
import { CommandSyntaxError } from "../../../../errors/command_errors/CommandSyntaxError";
import { DeprecatedCommandError } from "../../../../errors/command_errors/DeprecatedCommandError";
import { EmptyTokenError } from "../../../../errors/dal_errors/EmptyTokenError";
import { WrongYoutubeResponseType } from "../../../../errors/dal_errors/WrongYoutubeResponseType";
import { YoutubeProxy } from "../../../../helpers/proxies/YoutubeProxy";

export class TestCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("Test command", bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void>
    {
        if (wrapper.hasValue(["e", "error"]))
        {
            switch (wrapper.getValue(["e", "error"]))
            {
                case "arg":
                    throw new ArgumentError("Argument error message", "test string");
                case "exec":
                    throw new ExecutionError("Execution error", "execution error test string");
                case "command":
                    throw new CommandError(this, new Error("Test error"), "This is a test error");
                case "syntax":
                    throw new CommandSyntaxError(this, "Command error syntax test string");
                case "depre":
                    throw new DeprecatedCommandError("Deprecated command error test message");
                case "token":
                    throw new EmptyTokenError("Test token is empty");
                case "res":
                    throw new WrongYoutubeResponseType(undefined);
            }
        }

        let args = wrapper.args;
        args.forEach((v, k) =>
        {
            console.log(`{"${k}": "${v}"}`);
        });

        wrapper.sendToChannel(this.getTestCommands());
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