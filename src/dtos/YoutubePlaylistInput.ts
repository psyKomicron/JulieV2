import { ExecutionError } from "../errors/ExecutionError";
import { Params, YoutubeInput } from "./YoutubeInput";

/**Youtube API input to list items from a playlist. */
export class YoutubePlaylistInput extends YoutubeInput
{
    private _ids: Array<string>;
    private _playlistId: string;

    public get ids() { return this._ids; }
    public set ids(id) { this._ids = id; }

    public set id(id: string)
    { 
        if (id != undefined)
        {
            if (!this._ids)
            {
                this._ids = new Array<string>();
            }
            this._ids.push(id);
        }
    }

    public get playlistId() { return this._playlistId; }
    public set playlistId(id: string) { this._playlistId = id; }

    public constructor(params: Params) 
    {
        if ((params.id && !params.playlistId) || (!params.id && params.playlistId))
        {
            super(params);
            this.id = params.id;
            this.playlistId = params.playlistId;
        }
        else 
        {
            throw new ExecutionError("playlistId and id are exclusive and required", "ExecutionError");
        }
    }

    public flatten(): Object
    {
        if (this.ids && this.ids.length > 0)
        {
            return {
                token: this.token,
                part: this.part,
                id: this.getId()
            };
        }
        else 
        {
            return {
                token: this.token,
                part: this.part,
                playlistId: this.playlistId,
                maxResults: this.maxResults
            };
        }
    }

    private getId(): string 
    {
        if (this._ids.length == 1)
        {
            return this._ids[0];
        }
        else 
        {
            this._ids.reduce((previous, current) => current += previous + ",");
        }
    }
}