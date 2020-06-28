import { YoutubeInput } from "../../viewmodels/YoutubeQuestion";
import { YoutubeOutput } from "../../viewmodels/YoutubeReponse";
import { youtube_v3 } from "googleapis";

export class YoutubeProxy
{
    private youtubeV3: youtube_v3.Youtube;
    private question: YoutubeInput;
    private response: YoutubeOutput;

    public constructor(apiKey: string)
    {
        this.youtubeV3 = new youtube_v3.Youtube({auth: apiKey});
    }

    public async search(input: YoutubeInput): Promise<youtube_v3.Schema$SearchListResponse>
    {
        
        if (this.question && input.keyword == this.question.keyword)
        {
            return this.response;
        }
        else
        {
            this.question == input;
            //let searchResults = new Array<YoutubeOutput>();
            let response = await this.youtubeV3.search.list(this.flattenQuestion());
            if (response.data.kind == "youtube#videoListResponse")
            {
                response.data.items.forEach(item =>
                {

                });
            }
            else
            {
                throw new Error("Wrong return type from youtube");
            }
        }
    }
    /*
    searchResults.totalResults = res.data.pageInfo.totalResults;
        res.data.items.forEach(item =>
        {

            items.push(new YoutubeItem()
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
        })
    */

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

