import { ExecutionError } from "../ExecutionError";

export class ConfigurationError extends ExecutionError
{
    public constructor(message = "Configuration file is either not present, or not accessible. Please check.")
    {
        super(message, "ConfigurationError");
    }
}