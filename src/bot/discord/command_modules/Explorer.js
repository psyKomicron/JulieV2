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
exports.Explorer = void 0;
const fetch = require("node-fetch");
class Explorer {
    constructor(keyword, command) {
        this._keyword = keyword;
        this.command = command;
    }
    urlize(url, keyword, spaceReplace) {
        let keywordUrl = keyword.replace(/([ ])/g, spaceReplace);
        return url + keywordUrl;
    }
    get keyword() {
        return this._keyword;
    }
    set keyword(html) {
        this._keyword = html;
    }
    getHTML(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield fetch(url);
            let html = yield res.text();
            return html;
        });
    }
    send(embed) {
        this.command.send(embed);
    }
}
exports.Explorer = Explorer;
//# sourceMappingURL=Explorer.js.map