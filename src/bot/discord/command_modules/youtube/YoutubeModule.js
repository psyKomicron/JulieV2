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
exports.YoutubeModule = void 0;
const EmptyTokenError_1 = require("../../../../errors/dal_errors/EmptyTokenError");
const YoutubeInput_1 = require("../../../../dtos/YoutubeInput");
const YoutubeProxy_1 = require("../../../../helpers/proxies/YoutubeProxy");
const TokenReader_1 = require("../../../../dal/readers/TokenReader");
const YoutubePlaylistInput_1 = require("../../../../dtos/YoutubePlaylistInput");
class YoutubeModule {
    constructor(apiKey) {
        if (!apiKey.match(/ /g)) {
            this.service = new YoutubeProxy_1.YoutubeProxy(apiKey);
        }
        else {
            throw new EmptyTokenError_1.EmptyTokenError("Provided youtube authentication key is empty");
        }
    }
    get name() { return "youtube-module"; }
    ;
    searchVideos(keyword, maxResults, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            let opt = new YoutubeInput_1.YoutubeInput({
                token: TokenReader_1.TokenReader.getToken("youtube"),
                part: "snippet",
                order: "relevance",
                keyword: keyword,
                type: "video, playlist",
                relevanceLanguage: lang,
                maxResults: maxResults
            });
            let searchResults = yield this.service.search(opt);
            return searchResults;
        });
    }
    getPlaylistDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let playlistId = id;
            let input = new YoutubePlaylistInput_1.YoutubePlaylistInput({
                token: TokenReader_1.TokenReader.getToken("youtube"),
                part: "contentDetails",
                id: playlistId
            });
            let searchResult = yield this.service.listPlaylist(input);
            return searchResult;
        });
    }
    listPlaylistItems(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let playlistDetails = yield this.getPlaylistDetails(id);
            if (playlistDetails && playlistDetails.itemCount) {
                let input = new YoutubePlaylistInput_1.YoutubePlaylistInput({
                    token: TokenReader_1.TokenReader.getToken("youtube"),
                    part: "snippet",
                    playlistId: id,
                    maxResults: playlistDetails.totalResults > 50 ? playlistDetails.totalResults : 50
                });
                let results = yield this.service.listPlaylist(input);
                return results;
            }
        });
    }
    getPlaylistId(url) {
        if (url.match(/^https:\/\/www.youtube.com\/playlist\?list=.+/g)) {
            return url.substring(38);
        }
        else {
            return undefined;
        }
    }
}
exports.YoutubeModule = YoutubeModule;
//# sourceMappingURL=YoutubeModule.js.map