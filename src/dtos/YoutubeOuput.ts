import { YoutubeItem } from "./YoutubeItem";

export class YoutubeOutput
{
    private _kind: string;
    private _etag: string;
    private _pageInfo: PageInfo;
    private _items: Array<YoutubeItem> = new Array<YoutubeItem>();

    public get kind() { return this._kind; }
    public set kind(kind: string) { this._kind = kind; }

    public get etag() { return this._etag; }
    public set etag(etag: string) { this._etag = etag; }

    public get pageInfo(): PageInfo { return this._pageInfo; }
    public set pageInfo(value: PageInfo) { this._pageInfo = value; }

    public get items() { return this._items; }
    public set items(items: Array<YoutubeItem>) { this._items = items; }

    public get totalResults() { return this._pageInfo.totalResults; }

    public addItems(items: Array<YoutubeItem>): void
    {
        items.forEach(item => this._items.push(item));
    }

    public addItem(item: YoutubeItem): void
    {
        this._items.push(item);
    }
}

export interface PageInfo 
{
    totalResults?: number;
    resultsPerPage?: number;
}