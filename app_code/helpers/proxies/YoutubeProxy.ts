import { YoutubeQuestion } from "../../viewmodels/YoutubeQuestion";
import { YoutubeResponse } from "../../viewmodels/YoutubeReponse";
import { youtube_v3 } from "googleapis";

export class YoutubeProxy
{
    private youtubeV3: youtube_v3.Youtube;
    private question: YoutubeQuestion;
    private response: YoutubeResponse;

    public constructor(apiKey: string)
    {
        this.youtubeV3 = new youtube_v3.Youtube({auth: apiKey});
    }

    /**
     * Just a remote call for searchWithoutParams
     * @param input
     */
    public search(input: YoutubeQuestion): Promise<YoutubeResponse>
    {
        this.question = input;
        return this.searchWithoutParams();
    }

    public async searchWithoutParams(): Promise<YoutubeResponse>
    {
        if (this.response)
        {
            return this.response;
        }
        else
        {
            let searchResults = new Array<YoutubeResponse>();
            let response = await this.youtubeV3.search.list(this.flattenQuestion());
            response.data.items.forEach(element => 
            {
                searchResults.push(new YoutubeResponse()
                .set)
            });
        }
        return undefined;
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

