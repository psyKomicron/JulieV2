import { EmbedField, EmbedFieldData } from "discord.js";

/**Business object representing a MessageEmbed object from the discord.js API */
export class EmbedResolvable
{
    private _author: string;
    private _color: number;
    private _createdAt: Date;
    private _description: string;
    private _fields: Array<EmbedFieldData>;
    private _files: any[];
    private _footer: string;
    // check for hexadecimal format later
    private _hexColor: string; // HexValue
    private _image: string;
    private _length: number;
    private _provider: string;
    private _thumbnail: string;
    private _timestamp: Date;
    private _title: string;
    private _type: string;
    private _url: string;
    private _video: string;

    public get author(): string { return this._author; }
    public set author(value: string) { this._author = value; }

    public get color(): number { return this._color; }
    public set color(value: number) { this._color = value; }

    public get createdAt(): Date { return this._createdAt; }
    public set createdAt(value: Date) { this._createdAt = value; }

    public get description(): string { return this._description; }
    public set description(value: string) { this._description = value; }

    /**Not nullable field */
    public get fields(): Array<EmbedFieldData> { return this._fields; }
    public set fields(value: Array<EmbedFieldData>) { this._fields = value; }

    public get files(): any[] { return this._files; }
    public set files(value: any[]) { this._files = value; }

    public get footer(): string { return this._footer; }
    public set footer(value: string) { this._footer = value; }

    /**Not nullable field */
    public get timestamp(): Date { return this._timestamp; }
    public set timestamp(value: Date) { this._timestamp = value; }

    public get thumbnail(): string { return this._thumbnail; }
    public set thumbnail(value: string) { this._thumbnail = value; }

    public get provider(): string { return this._provider; }
    public set provider(value: string) { this._provider = value; }

    public get length(): number { return this._length; }
    public set length(value: number) { this._length = value; }

    /**Not nullable field */
    public get image(): string { return this._image; }
    public set image(value: string) { this._image = value; }

    public get hexColor(): string { return this._hexColor; }
    public set hexColor(value: string) { this._hexColor = value; }

    public get title(): string { return this._title; }
    public set title(value: string) { this._title = value; }

    public get type(): string { return this._type; }
    public set type(value: string) { this._type = value; }

    public get url(): string { return this._url; }
    public set url(value: string) { this._url = value; }

    public get video(): string { return this._video; }
    public set video(value: string) { this._video = value; }


    public setAuthor(author: string): EmbedResolvable
    {
        this.author = author;
        return this;
    }

    public setColor(color: number): EmbedResolvable
    {
        this.color = color;
        return this;
    }

    public setCreatedAt(date: Date): EmbedResolvable
    {
        this.createdAt = date;
        return this;
    }

    public setDescription(description: string): EmbedResolvable
    {
        this.description = description;
        return this;
    }

    public setFields(fields: Array<EmbedField>): EmbedResolvable
    {
        this.fields = fields;
        return this;
    }

    public setFiles(files: any[]): EmbedResolvable
    {
        this.files = files;
        return this;
    }

    public setFooter(footer: string): EmbedResolvable
    {
        this.footer = footer;
        return this;
    }

    public setHexColor(hexColor: string): EmbedResolvable
    {
        this.hexColor = hexColor;
        return this;
    }

    public setImage(imageUrl: string): EmbedResolvable
    {
        this.image = imageUrl;
        return this;
    }

    public setLength(length: number): EmbedResolvable
    {
        this.length = length;
        return this;
    }

    public setProvider(provider: string): EmbedResolvable
    {
        this.provider = provider;
        return this;
    }

    public setThumbnail(thumbnail: string): EmbedResolvable
    {
        this.thumbnail = thumbnail;
        return this;
    }

    public setTimestamp(timestamp: Date): EmbedResolvable
    {
        this.timestamp = timestamp;
        return this;
    }

    public setTitle(title: string): EmbedResolvable
    {
        this.title = title;
        return this;
    }

    public setType(type: string): EmbedResolvable
    {
        this.type = type;
        return this;
    }

    public setUrl(url: string): EmbedResolvable
    {
        this.url = url;
        return this;
    }

    public setVideo(video: string): EmbedResolvable
    {
        this.video = video;
        return this;
    }

    public addField(field: EmbedFieldData): EmbedResolvable
    {
        if (this.fields)
        {
            this.fields.push(field);
        }
        else
        {
            this.fields = new Array();
            this.fields.push(field);
        }
        return this;
    }
}