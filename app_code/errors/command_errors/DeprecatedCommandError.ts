import { ExecutionError } from "../ExecutionError";

export class DeprecatedCommandError extends ExecutionError
{
    public constructor()
    {
        super("DeprecatedCommandError", "Method/Command used is considered");
    }
}