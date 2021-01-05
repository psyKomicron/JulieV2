import { Command } from "../../bot/discord/commands/Command";
import { ExecutionError } from "../ExecutionError";

export class WrongArgumentError extends ExecutionError
{
    public constructor(command: Command, message = "Wrong argument")
    {
        super(message, command.name);
    }
}