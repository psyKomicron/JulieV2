import { ExecutionError } from "../ExecutionError";

export class EmptyTokenError extends ExecutionError
{
    public constructor(message: string)
    {
        super(message, "EmptyTokenError");
    }
}