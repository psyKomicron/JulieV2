"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeItem = void 0;
class YoutubeItem {
    get videoURL() { return this._videoURL; }
    set videoURL(value) { this._videoURL = value; }
    get kind() { return this._kind; }
    set kind(kind) { this._kind = kind; }
    get itemID() { return this._itemID; }
    set itemID(itemID) { this._itemID = itemID; }
    get title() { return this._title; }
    set title(title) { this._title = title; }
    get description() { return this._description; }
    set description(description) { this._description = description; }
    get thumbnails() { return this._thumbnails; }
    set thumbnails(thumbnails) { this._thumbnails = thumbnails; }
    setVideoURL(videoURL) {
        this._videoURL = videoURL;
        return this;
    }
    setKind(kind) {
        this._kind = kind;
        return this;
    }
    setItemID(itemID) {
        this._itemID = itemID;
        return this;
    }
    setTitle(title) {
        this._title = title;
        return this;
    }
    setDescription(description) {
        this._description = description;
        return this;
    }
    setThumbnails(thumbnails) {
        this._thumbnails = thumbnails;
        return this;
    }
}
exports.YoutubeItem = YoutubeItem;
//# sourceMappingURL=YoutubeItem.js.map