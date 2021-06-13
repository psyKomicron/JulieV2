export class Playlist
{
    private urls: Array<string> = new Array<string>();
    private index: number = 0;

    public get length() { return this.urls.length; }

    public add(url: string): void
    {
        this.urls.push(url);
    }

    public next(): string
    {
        if (this.index < this.urls.length)
        {
            let url = this.urls[this.index];
            this.index++;
            return url;
        }
        else 
        {
            return undefined;
        }
    }
}