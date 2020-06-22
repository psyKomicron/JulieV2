export class YoutubeItem
{
    /**HTTPS link leading to this item */
    private _videoURL: string;
    /**Kind of this item (e.g. 'youtube#video') */
    private _kind: string;
    /**ID of the item. Is undefined when this item is not a video*/
    private _itemID: string;
    /**Title of this item */
    private _title: string;
    /**Description of this item (e.g. classic youtube video description) */
    private _description: string;
    /**List of the thumbnails URIs of this item*/
    private _thumbnails: Array<string>;

    public get videoURL(): string { return this._videoURL; }
    public set videoURL(value: string) { this._videoURL = value; }

    public get kind() { return this._kind}
    public set kind(kind: string) { this._kind = kind; }

    public get itemID() { return this._itemID }
    public set itemID(itemID: string) { this._itemID = itemID; }

    public get title() { return this._title }
    public set title(title: string) { this._title = title; }

    public get description() { return this._description }
    public set description(description: string) { this._description = description; }

    public get thumbnails() { return this._thumbnails }
    public set thumbnails(thumbnails: Array<string>) { this._thumbnails = thumbnails; }


    public setVideoURL(videoURL: string): YoutubeItem
    {
        this._videoURL = videoURL;
        return this;
    }

    public setKind(kind: string): YoutubeItem
    {
        this._kind = kind;
        return this;
    }

    public setItemID(itemID: string): YoutubeItem
    {
        this._itemID = itemID;
        return this;
    }

    public setTitle(title: string): YoutubeItem
    {
        this._title = title;
        return this;
    }

    public setDescription(description: string): YoutubeItem
    {
        this._description = description;
        return this;
    }

    public setThumbnails(thumbnails: Array<string>): YoutubeItem
    {
        this._thumbnails = thumbnails;
        return this;
    }

}