export class YoutubeInput
{
    private _token: string;
    private _part: string;
    private _order: string;
    private _keyword: string;
    private _type: string;
    private _relevanceLanguage: string;
    private _maxResults: number;
    
    public get token() { return this._token; }
    public set token(token: string) { this._token = token; }

    public get part() { return this._part }
    public set part(part: string) { this._part = part; }

    public get order() { return this._order }
    public set order(order: string) { this._order = order }

    public get keyword() { return this._keyword }
    public set keyword(keyword: string) { this._keyword = keyword }

    public get type() { return this._type }
    public set type(type: string) { this._type = type }

    public get relevanceLanguage() { return this._relevanceLanguage }
    public set relevanceLanguage(relevanceLanguage: string) { this._relevanceLanguage = relevanceLanguage }

    public get maxResults() { return this._maxResults }
    public set maxResults(maxResults: number) { this._maxResults = maxResults }


    public setToken(token: string): YoutubeInput
    {
        this._token = token;
        return this;
    }

    public setPart(part: string): YoutubeInput
    {
        this._part = part;
        return this;
    }

    public setOrder(order: string): YoutubeInput
    {
        this._order = order;
        return this;
    }

    public setKeyword(keyword: string): YoutubeInput
    {
        this._keyword = keyword;
        return this;
    }

    public setType(type: string): YoutubeInput
    {
        this._type = type;
        return this;
    }

    public setRelevanceLanguage(relevanceLanguage: string): YoutubeInput
    {
        this._relevanceLanguage = relevanceLanguage;
        return this;
    }

    public setMaxResults(maxResults: number): YoutubeInput
    {
        this._maxResults = maxResults;
        return this;
    }

}