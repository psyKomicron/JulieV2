import { ExecutionError } from "./ExecutionError";

export class AlarmError extends ExecutionError
{
    public constructor(message: string)
    {
        super(message, AlarmError.name)
    }
}