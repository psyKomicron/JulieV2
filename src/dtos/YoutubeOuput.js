"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeOutput = void 0;
class YoutubeOutput {
    constructor() {
        this._items = new Array();
    }
    get kind() { return this._kind; }
    set kind(kind) { this._kind = kind; }
    get etag() { return this._etag; }
    set etag(etag) { this._etag = etag; }
    get pageInfo() { return this._pageInfo; }
    set pageInfo(value) { this._pageInfo = value; }
    get items() { return this._items; }
    set items(items) { this._items = items; }
    get totalResults() { return this._pageInfo.totalResults; }
    addItems(items) {
        items.forEach(item => this._items.push(item));
    }
    addItem(item) {
        this._items.push(item);
    }
}
exports.YoutubeOutput = YoutubeOutput;
//# sourceMappingURL=YoutubeOuput.js.map