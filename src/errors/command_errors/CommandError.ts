import { ExecutionError } from "../ExecutionError";
import { Command } from "../../bot/discord/commands/Command";

/**Use this class to send friendly error messages to the client.*/
export class CommandError extends ExecutionError
{
    private command: Command;

    public constructor(command: Command, message?: string, internalError: Error = null)
    {
        super(message ?? "Command " + command.name + " failed. Check details below.", command.name);
        this.internalError = internalError;
        this.command = command;
    }

    public get commandName() { return this.command.name; }

    public toString(): string
    {
        if (this.internalError)
        {
            let internal: string = this.internalError.toString();
            return super.toString() + "\n\tInternal error:\n" + internal;
        }
        else
        {
            return super.toString();
        }
    }
}