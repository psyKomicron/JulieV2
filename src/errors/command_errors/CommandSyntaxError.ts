import { Command } from "../../bot/discord/commands/Command";
import { ExecutionError } from "../ExecutionError";
import { CommandError } from "./CommandError";

export class CommandSyntaxError extends CommandError
{
    public constructor(command: Command, message: string = "Syntax error in the command")
    {
        super(command, message);
    }
}