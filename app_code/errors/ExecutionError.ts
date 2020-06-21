export abstract class ExecutionError extends Error
{
    protected constructor(message, name: string)
    {
        super(message);
        this.name = name;
    }
}