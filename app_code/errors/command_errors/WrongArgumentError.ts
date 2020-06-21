import { Command } from "../../bot/commands/Command";
import { ExecutionError } from "../ExecutionError";

export class WrongArgumentError extends ExecutionError
{
    public constructor(command: Command, message = "Wrong argument")
    {
        super(message, command.name);
    }
}