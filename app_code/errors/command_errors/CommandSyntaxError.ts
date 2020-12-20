import { Command } from "../../bot/commands/Command";
import { ExecutionError } from "../ExecutionError";

export class CommandSyntaxError extends ExecutionError
{
    public constructor(command: Command, message: string = "Syntax error in the command")
    {
        super(message, command.name);
    }
}