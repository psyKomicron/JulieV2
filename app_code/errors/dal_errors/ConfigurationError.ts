import { ExecutionError } from "../ExecutionError";

export class ConfigurationError extends ExecutionError
{
    public constructor()
    {
        super("Configuration file is either not present, or not accessible. Please check", "ConfigurationError");
    }
}