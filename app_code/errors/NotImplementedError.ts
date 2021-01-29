import { ExecutionError } from "./ExecutionError";

export class NotImplementedError extends ExecutionError
{
    public constructor()
    {
        super("This method has not been implemented yet", "NotImplementedError");
    }
}