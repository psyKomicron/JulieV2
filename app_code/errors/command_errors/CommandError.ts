import { ExecutionError } from "../ExecutionError";
import { Command } from "../../bot/commands/Command";

/**Use this class to send friendly error messages to the client.*/
export class CommandError extends ExecutionError
{
    public constructor(message: string, command: Command)
    {
        super(message, command.name);
    }
}