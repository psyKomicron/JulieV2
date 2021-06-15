"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeProxy = void 0;
const googleapis_1 = require("googleapis");
const YoutubeOuput_1 = require("../../dtos/YoutubeOuput");
const YoutubeItem_1 = require("../../dtos/YoutubeItem");
const Tools_1 = require("../Tools");
const WrongYoutubeResponseType_1 = require("../../errors/dal_errors/WrongYoutubeResponseType");
const Printer_1 = require("../../console/Printer");
const YoutubePlaylistOutput_1 = require("../../dtos/YoutubePlaylistOutput");
class YoutubeProxy {
    constructor(apiKey) {
        this.youtubeUrl = "https://www.youtube.com/watch?v=";
        setInterval(() => YoutubeProxy.cache.clear(), 350000);
        this.youtubeV3 = new googleapis_1.youtube_v3.Youtube({ auth: apiKey });
    }
    get name() { return "youtube-proxy"; }
    search(input) {
        return __awaiter(this, void 0, void 0, function* () {
            YoutubeProxy.cache.forEach((value, key) => {
                if (key.equals(input)) {
                    Printer_1.Printer.info("Getting youtube search from cache");
                    return value;
                }
            });
            let response = yield this.youtubeV3.search.list(input.flatten());
            if (response.data.kind == "youtube#searchListResponse") {
                let output = new YoutubeOuput_1.YoutubeOutput();
                output.pageInfo = response.data.pageInfo;
                response.data.items.forEach(item => {
                    output.addItem(new YoutubeItem_1.YoutubeItem()
                        .setVideoURL(this.youtubeUrl + item.id.videoId)
                        .setItemID(item.id.videoId)
                        .setTitle(Tools_1.Tools.cleanHtml(item.snippet.title))
                        .setKind(item.kind)
                        .setDescription(Tools_1.Tools.cleanHtml(item.snippet.description))
                        .setThumbnails([
                        item.snippet.thumbnails.default.url,
                        item.snippet.thumbnails.medium.url,
                        item.snippet.thumbnails.high.url
                    ]));
                });
                return output;
            }
            else {
                throw new WrongYoutubeResponseType_1.WrongYoutubeResponseType(this);
            }
        });
    }
    listPlaylist(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (input.part == "contentDetails") {
                let response = yield this.youtubeV3.playlists.list(input.flatten());
                let output = new YoutubePlaylistOutput_1.YoutubePlaylistOutput();
                output.kind = response.data.kind;
                output.etag = response.data.etag;
                output.pageInfo = response.data.pageInfo;
                if (response.data.items && response.data.items.length == 1) {
                    let item = response.data.items[0];
                    output.id = item.id;
                    output.itemCount = item.contentDetails.itemCount;
                }
                return output;
            }
            else {
                let response = yield this.youtubeV3.playlistItems.list(input.flatten());
                if (response.data.kind == "youtube#playlistItemListResponse") {
                    let output = new YoutubePlaylistOutput_1.YoutubePlaylistOutput();
                    output.kind = response.data.kind;
                    output.etag = response.data.etag;
                    output.pageInfo = response.data.pageInfo;
                    response.data.items.forEach(item => {
                        output.addItem(new YoutubeItem_1.YoutubeItem()
                            .setVideoURL(this.youtubeUrl + item.snippet.resourceId.videoId)
                            .setDescription(item.snippet.description)
                            .setItemID(item.id)
                            .setTitle(Tools_1.Tools.cleanHtml(item.snippet.title))
                            .setKind(item.kind)
                            .setDescription(Tools_1.Tools.cleanHtml(item.snippet.description))
                            .setThumbnails([
                            item.snippet.thumbnails.default.url,
                            item.snippet.thumbnails.medium.url,
                            item.snippet.thumbnails.high.url
                        ]));
                    });
                    return output;
                }
                else {
                    throw new WrongYoutubeResponseType_1.WrongYoutubeResponseType(this);
                }
            }
        });
    }
}
exports.YoutubeProxy = YoutubeProxy;
YoutubeProxy.cache = new Map();
//# sourceMappingURL=YoutubeProxy.js.map