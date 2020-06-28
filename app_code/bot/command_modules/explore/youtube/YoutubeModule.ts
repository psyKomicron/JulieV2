import { youtube_v3 } from 'googleapis';
import { EmptyTokenError } from '../../../../errors/dal_errors/EmptyTokenError';
import { YoutubeItem } from '../../../../viewmodels/copy_books/YoutubeItem';
import { Tools } from '../../../../helpers/Tools';
import { YoutubeInput } from '../../../../viewmodels/YoutubeQuestion';
import { YoutubeProxy } from '../../../../helpers/proxies/YoutubeProxy';

export class YoutubeModule
{
    private service: YoutubeProxy;

    public constructor(apiKey: string)
    {
        if (!apiKey.match(/([ ])/g))
        {
            this.service = new YoutubeProxy(apiKey); //new youtube_v3.Youtube({ auth: apiKey });
        }
        else throw new EmptyTokenError("Provided key is empty", this.name);
    }

    public get name() { return "youtube-module" };

    /**
     * Search for videos on the Youtube platform and returns an array of results from this request.
     * @param keyword keyword to search for
     * @param maxResults number of maximum results to search
     * @param lang language in wich @keyword is the most relevant for a search
     */
    public async searchVideos(keyword: string, maxResults: number, lang: string): Promise<SearchResults>
    {
        const youtubeUrl = "https://www.youtube.com/watch?v=";
        let opt = new YoutubeInput()
            .setPart("snippet")
            .setOrder("viewCount")
            .setKeyword(keyword)
            .setType("video")
            .setRelevanceLanguage(lang)
            .setMaxResults(maxResults);

        let items = new Array<YoutubeItem>();
        let searchResults: SearchResults = { totalResults: 0, items: items }
        let res = await this.service.search(opt);

        // change according to proxy service
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
        // end
        return searchResults;
    }
}

export interface SearchResults
{
    /**Number of results returned by the search on Youtube */
    totalResults: number;
    /**Array of search results originating from the request to Youtube's API, transformed for easier use*/
    items: Array<YoutubeItem>;
}