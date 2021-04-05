import { IEquatable } from "../IEquatable";
import { IFlattenable } from "../IFlattenable";

export class YoutubeInput implements IFlattenable, IEquatable<YoutubeInput>
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

    public constructor(params: Params)
    {
        this.token = params.token;
        this.part = params.part;
        this.order = params.order;
        this.keyword = params.keyword;
        this.type = params.type;
        this.relevanceLanguage = params.relevanceLanguage ?? "en";
        this.maxResults = params.maxResults ?? 10;
    }

    public flatten(): Object
    {
        return {
            token: this.token,
            part: this.part,
            order: this.order,
            q: this.keyword,
            type: this.type,
            relevanceLanguage: this.relevanceLanguage,
            maxResults: this.maxResults
        };
    }

    public equals(other: YoutubeInput): boolean
    {
        return this.token == other.token 
            && this.part == other.part 
            && this.order == other.order
            && this.keyword == other.keyword
            && this.type == other.type
            && this.relevanceLanguage == other.relevanceLanguage
            && this.maxResults == other.maxResults;
    }
}

export interface Params 
{
    token: string;
    part: string;
    order?: string;
    keyword?: string;
    type?: string;
    relevanceLanguage?: string;
    maxResults?: number;
    id?: string;
    playlistId?: string;
}