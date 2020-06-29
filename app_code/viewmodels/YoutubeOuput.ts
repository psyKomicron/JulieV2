import { YoutubeItem } from "./copy_books/YoutubeItem";

export class YoutubeOutput
{
    private _items: Array<YoutubeItem> = new Array<YoutubeItem>();
    private _totalResults: number;

    public get items() { return this._items; }
    public set items(items: Array<YoutubeItem>) { this._items = items; }

    public get totalResults() { return this._totalResults; }
    public set totalResults(results: number) { this._totalResults = results; }

    public addItems(items: Array<YoutubeItem>): void
    {
        items.forEach(item => this._items.push(item));
    }

    public addItem(item: YoutubeItem): void
    {
        this._items.push(item);
    }
}