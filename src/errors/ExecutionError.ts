/**Mother class for all errors of this application*/
export class ExecutionError extends Error
{
    public constructor(message: string, name: string)
    {
        super(message);
        this.name = name;
    }

    public toString(): string
    {
        return this.message + "\n\t" + this.stack;
    }
}