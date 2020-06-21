export class ConfigData
{
    private _releaseMode: string;
    private _quickness: number;

    public get release() { return this._releaseMode; }

    public get quickness() { return this._quickness; }
}