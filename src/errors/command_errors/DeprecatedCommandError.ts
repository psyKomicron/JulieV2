import { ExecutionError } from "../ExecutionError";

export class DeprecatedCommandError extends ExecutionError
{
    public constructor(friendlyName: string)
    {
        super("Command is not currently up to date. For now consider not using it until it is updated. :)", friendlyName);
    }
}