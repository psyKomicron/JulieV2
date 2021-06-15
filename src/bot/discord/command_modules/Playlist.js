"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
class Playlist {
    constructor() {
        this.urls = new Array();
        this.index = 0;
    }
    get length() { return this.urls.length; }
    add(url) {
        this.urls.push(url);
    }
    next() {
        if (this.index < this.urls.length) {
            let url = this.urls[this.index];
            this.index++;
            return url;
        }
        else {
            return undefined;
        }
    }
}
exports.Playlist = Playlist;
//# sourceMappingURL=Playlist.js.map