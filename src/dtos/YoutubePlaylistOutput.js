"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubePlaylistOutput = void 0;
const YoutubeOuput_1 = require("./YoutubeOuput");
class YoutubePlaylistOutput extends YoutubeOuput_1.YoutubeOutput {
    get id() { return this._id; }
    set id(id) { this._id = id; }
    set itemCount(itemCount) { this._itemCount = itemCount; }
    get itemCount() { return this._itemCount; }
}
exports.YoutubePlaylistOutput = YoutubePlaylistOutput;
//# sourceMappingURL=YoutubePlaylistOutput.js.map