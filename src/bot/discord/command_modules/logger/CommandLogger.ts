import { MessageWrapper } from "../../../common/MessageWrapper";
import { Command } from "../../commands/Command";
import { LoggableCommand } from "../../commands/LoggableCommand";

export class CommandLogger
{
    //private readonly commands = new Map<RegExp, Array<LoggableCommand>>();
    private readonly commands = new Array<CommandChain>();

    public handle(message: MessageWrapper): boolean
    {
        for (let index = 0; index < this.commands.length; index++) 
        {
            const value = this.commands[index];
            if (value.match(message.content))
            {
                for (let i = 0; i < value.commands.length; i++) 
                {
                    if (value.commands[i].guild == message.guild)
                    {
                        value.commands[i].execute(message);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //protected abstract work(message: MessageWrapper): Promise<void>;

    public logCommand(command: LoggableCommand, regex: RegExp): void
    {
        for (let i = 0; i < this.commands.length; i++) 
        {
            if (this.commands[i].regex.source == regex.source)
            {
                this.commands[i].addCommand(command);
                return;
            }            
        }
        
        this.commands.push(new CommandChain(regex, command));
    }
}

class CommandChain
{
    private _regex: RegExp;
    private _commands: Array<LoggableCommand> = new Array(5);

    public constructor(regex: RegExp, command: LoggableCommand)
    {
        this._regex = regex;
        this.addCommand(command);
    }

    public get regex(): RegExp { return this._regex };
    public get commands(): Array<LoggableCommand> { return this._commands; }

    public addCommand(command: LoggableCommand)
    {
        let index = this._commands.length + 1;
        this._commands.push(command);
        command.on("end", () => 
        {
            this._commands.
        });
    }

    public removeCommand(command: LoggableCommand)
    {
        for (var i = 0; i < this._commands.length; i++) 
        {
            if (this._commands[i] == command)
            {
                break;
            }
        }

        for (; i < this._commands.length - 1; i++)
        {
            this._commands[i] = this._commands[i + 1];
        }
    }

    public match(s: string): boolean
    {
        return this._regex.test(s);
    }
}