import { ExecutionError } from "../ExecutionError";

export class EmptyTokenError extends ExecutionError
{
    public constructor(message: string, name: string)
    {
        super(message, name);
    }
}