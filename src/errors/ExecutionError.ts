/**Mother class for all errors of this application*/
export class ExecutionError extends Error
{
    private _internalError: Error;

    public constructor(message: string, name: string)
    {
        super(message);
        this.name = name;
    }

    public get internalError(): Error { return this._internalError; }
    public set internalError(error) { this._internalError = error; }

    public toString(): string
    {
        return this.stack;
    }
}