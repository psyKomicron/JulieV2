import { ExecutionError } from "./ExecutionError";

export class OutOfRangeError extends ExecutionError
{
    public constructor()
    {
        super("Index was out of range", "OutOfRangeError");
    }
}