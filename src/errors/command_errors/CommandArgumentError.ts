import { Command } from "../../bot/discord/commands/Command";
import { CommandError } from "./CommandError";

export class CommandArgumentError extends CommandError
{
    public constructor(command: Command, message: string, parameterName: string)
    {
        super(command, message + "\nParameter name: " + parameterName);
    }
}