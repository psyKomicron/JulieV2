import { EmptyTokenError } from '../../../../../errors/dal_errors/EmptyTokenError';
import { YoutubeInput } from '../../../../../dtos/YoutubeInput';
import { YoutubeProxy } from '../../../../../helpers/proxies/YoutubeProxy';
import { TokenReader } from '../../../../../dal/readers/TokenReader';
import { YoutubeOutput } from '../../../../../dtos/YoutubeOuput';
import { Printer } from '../../../../../console/Printer';

/**Class to interact with the Youtube API */
export class YoutubeModule
{
    private service: YoutubeProxy;

    public get name() { return "youtube-module" };

    public constructor(apiKey: string)
    {
        if (!apiKey.match(/([ ])/g))
        {
            this.service = new YoutubeProxy(apiKey);
        }
        else
        {
            throw new EmptyTokenError("Provided youtube authentication key is empty");
        }
    }

    /**
     * Search for videos on the Youtube platform and returns an array of results from this request.
     * @param keyword keyword to search for
     * @param maxResults number of maximum results to search
     * @param lang language in wich @keyword is the most relevant for a search
     */
    public async searchVideos(keyword: string, maxResults: number, lang: string): Promise<YoutubeOutput>
    {
        let opt = new YoutubeInput()
            .setToken(TokenReader.getToken("youtube"))
            .setPart("snippet")
            .setOrder("viewCount")
            .setKeyword(keyword)
            .setType("video")
            .setRelevanceLanguage(lang)
            .setMaxResults(maxResults);

        let searchResults = await this.service.search(opt);
        return searchResults;
    }
}