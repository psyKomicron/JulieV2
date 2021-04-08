export class BotUser
{
    private _isDev: boolean;

    public get isDev(): boolean { return this._isDev; }
    public set isDev(value) { this._isDev = value; }
}