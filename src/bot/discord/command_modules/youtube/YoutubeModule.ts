import { EmptyTokenError } from '../../../../errors/dal_errors/EmptyTokenError';
import { YoutubeInput } from '../../../../dtos/YoutubeInput';
import { YoutubeProxy } from '../../../../helpers/proxies/YoutubeProxy';
import { TokenReader } from '../../../../dal/readers/TokenReader';
import { YoutubeOutput } from '../../../../dtos/YoutubeOuput';
import { YoutubePlaylistInput } from "../../../../dtos/YoutubePlaylistInput";
import { YoutubePlaylistOutput } from "../../../../dtos/YoutubePlaylistOutput";

/**Class to interact with the Youtube API */
export class YoutubeModule
{
    private service: YoutubeProxy;

    public get name() { return "youtube-module" };

    public constructor(apiKey: string)
    {
        if (!apiKey.match(/ /g))
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
        let opt = new YoutubeInput({
            token: TokenReader.getToken("youtube"),
            part: "snippet",
            order: "relevance",
            keyword: keyword,
            type: "video, playlist",
            relevanceLanguage: lang,
            maxResults: maxResults
        });

        let searchResults = await this.service.search(opt);
        return searchResults;
    }

    public async getPlaylistDetails(id: string): Promise<YoutubePlaylistOutput>
    {
        let playlistId = id;

        let input = new YoutubePlaylistInput(
        {
            token: TokenReader.getToken("youtube"),
            part: "contentDetails",
            id: playlistId
        });

        let searchResult = await this.service.listPlaylist(input);
        return searchResult;
    }

    public async listPlaylistItems(id: string): Promise<YoutubePlaylistOutput>
    {
        let playlistDetails = await this.getPlaylistDetails(id);
        if (playlistDetails && playlistDetails.itemCount)
        {
            let input = new YoutubePlaylistInput({
                token: TokenReader.getToken("youtube"),
                part: "snippet",
                playlistId: id,
                maxResults: playlistDetails.totalResults > 50 ? playlistDetails.totalResults : 50
            });

            let results = await this.service.listPlaylist(input);
            return results;
        }
    }

    public getPlaylistId(url: string)
    {
        if (url.match(/^https:\/\/www.youtube.com\/playlist\?list=.+/g))
        {
            return url.substring(38);
        }
        else 
        {
            return undefined;
        }
    }
}