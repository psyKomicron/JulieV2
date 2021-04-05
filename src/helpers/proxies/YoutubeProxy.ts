import { YoutubeInput } from "../../dtos/YoutubeInput";
import { youtube_v3 } from "googleapis";
import { YoutubeOutput } from "../../dtos/YoutubeOuput";
import { YoutubeItem } from "../../dtos/YoutubeItem";
import { Tools } from "../Tools";
import { WrongYoutubeResponseType } from "../../errors/dal_errors/WrongYoutubeResponseType";
import { Printer } from "../../console/Printer";
import { NotImplementedError } from "../../errors/NotImplementedError";
import { YoutubePlaylistOutput } from "../../dtos/YoutubePlaylistOutput";
import { YoutubePlaylistInput } from "../../dtos/YoutubePlaylistInput";

/**Proxy to communicate */
export class YoutubeProxy
{
    private readonly youtubeUrl = "https://www.youtube.com/watch?v=";

    private static cache: Map<YoutubeInput, YoutubeOutput> = new Map<YoutubeInput, YoutubeOutput>();
    private youtubeV3: youtube_v3.Youtube;

    public get name() { return "youtube-proxy"; }

    public constructor(apiKey: string)
    {
        setInterval(() => YoutubeProxy.cache.clear(), 350000);
        this.youtubeV3 = new youtube_v3.Youtube({auth: apiKey});
    }

    /**
     * Search on youtube for videos.
     * @param input query for the youtubeV3 API
     * @returns result from the query
     * @throws WrongYoutubeResponseType
     */
    public async search(input: YoutubeInput): Promise<YoutubeOutput>
    {
        YoutubeProxy.cache.forEach((value, key) => 
        {
            if (key.equals(input))
            {
                Printer.info("Getting youtube search from cache");
                return value;
            }
        });

        let response = await this.youtubeV3.search.list(input.flatten());
        
        if (response.data.kind == "youtube#searchListResponse")
        {
            let output = new YoutubeOutput();
            output.pageInfo = response.data.pageInfo;
            response.data.items.forEach(item =>
            {
                output.addItem(new YoutubeItem()
                    .setVideoURL(this.youtubeUrl + item.id.videoId)
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

            return output;
        }
        else
        {
            throw new WrongYoutubeResponseType(this);
        }

    }

    public async listPlaylist(input: YoutubePlaylistInput): Promise<YoutubePlaylistOutput>
    {
        if (input.part == "contentDetails")
        {
            let response = await this.youtubeV3.playlists.list(input.flatten());

            let output = new YoutubePlaylistOutput();
            output.kind = response.data.kind;
            output.etag = response.data.etag;
            output.pageInfo = response.data.pageInfo;

            if (response.data.items && response.data.items.length == 1)
            {
                let item = response.data.items[0]
                output.id = item.id;
                output.itemCount = item.contentDetails.itemCount;
            }

            return output;
        }
        else 
        {
            let response = await this.youtubeV3.playlistItems.list(input.flatten());

            if (response.data.kind == "youtube#playlistItemListResponse")
            {
                let output = new YoutubePlaylistOutput();
                output.kind = response.data.kind;
                output.etag = response.data.etag;
                output.pageInfo = response.data.pageInfo;

                response.data.items.forEach(item => 
                {
                    output.addItem(new YoutubeItem()
                        .setVideoURL(this.youtubeUrl + item.snippet.resourceId.videoId)
                        .setDescription(item.snippet.description)
                        .setItemID(item.id)
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

                return output;
            }
            else
            {
                throw new WrongYoutubeResponseType(this);
            }
        }
    }
}

