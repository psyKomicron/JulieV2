import { Command } from "../../bot/commands/Command";
import { ExecutionError } from "../ExecutionError";

export class CommandSyntaxError extends ExecutionError
{
    public constructor(command: Command)
    {
        super("Syntax error in the command", command.name);
    }
}