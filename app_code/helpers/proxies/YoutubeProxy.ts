import { YoutubeInput } from "../../dtos/YoutubeInput";
import { youtube_v3 } from "googleapis";
import { YoutubeOutput } from "../../dtos/YoutubeOuput";
import { YoutubeItem } from "../../dtos/copy_books/YoutubeItem";
import { Tools } from "../Tools";
import { WrongYoutubeResponseType } from "../../errors/WrongYoutubeResponseType";

export class YoutubeProxy
{
    private youtubeV3: youtube_v3.Youtube;
    private question: YoutubeInput;
    private response: YoutubeOutput;
    private static cache: Array<YoutubeInput> = new Array<YoutubeInput>();

    public get name() { return "youtube-proxy"; }

    public constructor(apiKey: string)
    {
        setInterval(() => YoutubeProxy.cache = new Array<YoutubeInput>(), 350000);
        this.youtubeV3 = new youtube_v3.Youtube({auth: apiKey});
    }

    public async search(input: YoutubeInput): Promise<YoutubeOutput>
    {
        let output = new YoutubeOutput();
        if (YoutubeProxy.cache.find(value => value.keyword == input.keyword))
        {
            console.log("Value in cache");
            return this.response;
        }
        else
        {
            YoutubeProxy.cache.push(input);
            this.question = input;
            const youtubeUrl = "https://www.youtube.com/watch?v=";
            let response = await this.youtubeV3.search.list(this.flattenQuestion());
            output.totalResults = response.data.pageInfo.totalResults;
            if (response.data.kind == "youtube#searchListResponse")
            {
                response.data.items.forEach(item =>
                {
                    output.addItem(new YoutubeItem()
                        .setVideoURL(youtubeUrl + item.id.videoId)
                        .setItemID(item.id.videoId)
                        .setTitle(Tools.cleanHtml(item.snippet.title))
                        .setKind(item.kind)
                        .setDescription(Tools.cleanHtml(item.snippet.description))
                        .setThumbnails([
                            item.snippet.thumbnails.default.url,
                            item.snippet.thumbnails.medium.url,
                            item.snippet.thumbnails.high.url
                        ])
                    );
                });
            }
            else
            {
                throw new WrongYoutubeResponseType(this);
            }
        }
        return output;
    }

    private flattenQuestion(): Object
    {
        return {
            token: this.question.token,
            part: this.question.part,
            order: this.question.order,
            q: this.question.keyword,
            type: this.question.type,
            relevanceLanguage: this.question.relevanceLanguage,
            maxResults: this.question.maxResults
        }
    }
}

