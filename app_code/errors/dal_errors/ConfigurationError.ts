import { ExecutionError } from "../ExecutionError";

export class ConfigurationError extends ExecutionError
{
    public constructor(message: string)
    {
        super(message, "ConfigurationError");
    }
}