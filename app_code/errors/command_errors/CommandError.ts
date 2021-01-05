import { ExecutionError } from "../ExecutionError";
import { Command } from "../../bot/discord/commands/Command";

/**Use this class to send friendly error messages to the client.*/
export class CommandError extends ExecutionError
{
    private _internalError: ExecutionError;

    public constructor(message: string, command: Command, internalError: ExecutionError = null)
    {
        super(message, command.name);
        this._internalError = internalError;
    }

    public get internalError(): ExecutionError { return this._internalError; }

    public toString(): string
    {
        if (this.internalError)
        {
            return this.internalError.toString();
        }
        else
        {
            return super.toString();
        }
    }
}