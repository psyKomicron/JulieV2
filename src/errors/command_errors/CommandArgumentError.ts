import { Command } from "../../bot/discord/commands/Command";
import { CommandError } from "./CommandError";

export class CommandArgumentError extends CommandError
{
    private _argumentName: string;

    public constructor(command: Command, message: string, argumentName: string)
    {
        super(command, message + "\nParameter name: " + argumentName);
        this._argumentName = argumentName;
    }

    public get argumentName() { return this._argumentName; }
}