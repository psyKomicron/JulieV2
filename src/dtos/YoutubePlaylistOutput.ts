import { YoutubeOutput } from "./YoutubeOuput";

export class YoutubePlaylistOutput extends YoutubeOutput
{
    private _id: string;
    private _itemCount: number;

    public get id() { return this._id; }
    public set id(id: string) { this._id = id; }

    public set itemCount(itemCount: number) { this._itemCount = itemCount; }
    public get itemCount() { return this._itemCount; }
}