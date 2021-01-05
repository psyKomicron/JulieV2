/**Business object for the app configuration */
export class ConfigData
{
    private _releaseMode: string;
    private _quickness: number;
    private _culture: string;

    public get release() { return this._releaseMode; }

    public get quickness() { return this._quickness; }

    public get culture() { return this._culture; }
}