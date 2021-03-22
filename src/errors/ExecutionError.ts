/**Mother class for all errors of this application*/
export abstract class ExecutionError extends Error
{
    protected constructor(message, name: string)
    {
        super(message);
        this.name = name;
    }

    public toString(): string
    {
        return this.stack; 
    }
}