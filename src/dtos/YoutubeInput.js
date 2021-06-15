"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeInput = void 0;
class YoutubeInput {
    constructor(params) {
        var _a, _b;
        this.token = params.token;
        this.part = params.part;
        this.order = params.order;
        this.keyword = params.keyword;
        this.type = params.type;
        this.relevanceLanguage = (_a = params.relevanceLanguage) !== null && _a !== void 0 ? _a : "en";
        this.maxResults = (_b = params.maxResults) !== null && _b !== void 0 ? _b : 10;
    }
    get token() { return this._token; }
    set token(token) { this._token = token; }
    get part() { return this._part; }
    set part(part) { this._part = part; }
    get order() { return this._order; }
    set order(order) { this._order = order; }
    get keyword() { return this._keyword; }
    set keyword(keyword) { this._keyword = keyword; }
    get type() { return this._type; }
    set type(type) { this._type = type; }
    get relevanceLanguage() { return this._relevanceLanguage; }
    set relevanceLanguage(relevanceLanguage) { this._relevanceLanguage = relevanceLanguage; }
    get maxResults() { return this._maxResults; }
    set maxResults(maxResults) { this._maxResults = maxResults; }
    flatten() {
        return {
            token: this.token,
            part: this.part,
            order: this.order,
            q: this.keyword,
            type: this.type,
            relevanceLanguage: this.relevanceLanguage,
            maxResults: this.maxResults
        };
    }
    equals(other) {
        return this.token == other.token
            && this.part == other.part
            && this.order == other.order
            && this.keyword == other.keyword
            && this.type == other.type
            && this.relevanceLanguage == other.relevanceLanguage
            && this.maxResults == other.maxResults;
    }
}
exports.YoutubeInput = YoutubeInput;
//# sourceMappingURL=YoutubeInput.js.map