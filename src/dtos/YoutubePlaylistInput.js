"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubePlaylistInput = void 0;
const ExecutionError_1 = require("../errors/ExecutionError");
const YoutubeInput_1 = require("./YoutubeInput");
class YoutubePlaylistInput extends YoutubeInput_1.YoutubeInput {
    constructor(params) {
        if ((params.id && !params.playlistId) || (!params.id && params.playlistId)) {
            super(params);
            this.id = params.id;
            this.playlistId = params.playlistId;
        }
        else {
            throw new ExecutionError_1.ExecutionError("playlistId and id are exclusive and required", "ExecutionError");
        }
    }
    get ids() { return this._ids; }
    set ids(id) { this._ids = id; }
    set id(id) {
        if (id != undefined) {
            if (!this._ids) {
                this._ids = new Array();
            }
            this._ids.push(id);
        }
    }
    get playlistId() { return this._playlistId; }
    set playlistId(id) { this._playlistId = id; }
    flatten() {
        if (this.ids && this.ids.length > 0) {
            return {
                token: this.token,
                part: this.part,
                id: this.getId()
            };
        }
        else {
            return {
                token: this.token,
                part: this.part,
                playlistId: this.playlistId,
                maxResults: this.maxResults
            };
        }
    }
    getId() {
        if (this._ids.length == 1) {
            return this._ids[0];
        }
        else {
            this._ids.reduce((previous, current) => current += previous + ",");
        }
    }
}
exports.YoutubePlaylistInput = YoutubePlaylistInput;
//# sourceMappingURL=YoutubePlaylistInput.js.map