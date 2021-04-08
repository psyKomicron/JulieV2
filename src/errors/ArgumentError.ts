import { ExecutionError } from "./ExecutionError";

export class ArgumentError extends ExecutionError
{
    public constructor(message: string, parameterName: string)
    {
        super(message + "\nParameter name: " + parameterName, ArgumentError.name);
    }
}