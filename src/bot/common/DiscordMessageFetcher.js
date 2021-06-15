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
exports.DiscordObjectGetter = void 0;
const ArgumentError_1 = require("../../errors/ArgumentError");
const Tools_1 = require("../../helpers/Tools");
class DiscordObjectGetter {
    constructor() {
        this.DEFAULT_CHUNK_VALUE = 50;
    }
    fetch(channel, messagesAmount, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.isChannelNullOrUndefined(channel);
            let messages = yield channel.messages.fetch();
            let resMessages = new Array();
            let nullMessageFilter = (message) => message != undefined;
            messages.filter(nullMessageFilter);
            messages.forEach((message) => resMessages.push(message));
            if (resMessages.length < messagesAmount) {
                while (resMessages.length < messagesAmount) {
                    let lastMessageID = yield ((_a = messages.last()) === null || _a === void 0 ? void 0 : _a.id);
                    if (lastMessageID == undefined) {
                        break;
                    }
                    else {
                        messages = yield channel.messages.fetch({ limit: this.getChunk(options === null || options === void 0 ? void 0 : options.chunk, resMessages.length), before: lastMessageID });
                        messages.filter(nullMessageFilter)
                            .forEach((message) => resMessages.push(message));
                    }
                }
            }
            if (!(options === null || options === void 0 ? void 0 : options.overflow)) {
                return Tools_1.Tools.slice(resMessages, messagesAmount);
            }
            return resMessages;
        });
    }
    fetchToday(channel, ignoreList) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isChannelNullOrUndefined(channel);
            let date = new Date(Date.now());
            var filter = (message, ignoreList, date) => {
                let isIn = false;
                if (ignoreList instanceof Array) {
                    for (var i = 0; i < ignoreList.length; i++) {
                        if (ignoreList[i].id == message.id) {
                            return true;
                        }
                    }
                }
                else if (ignoreList) {
                    return ignoreList.id == message.id;
                }
                return message != undefined
                    && (message.createdAt.getFullYear() == date.getFullYear()
                        && message.createdAt.getMonth() == date.getMonth()
                        && message.createdAt.getDate() == date.getDate()
                        && message.createdAt.getDay() == date.getDay())
                    && isIn;
            };
            let messages = yield this.fetchAndFilter(channel, 100, filter, undefined, true, ignoreList, date);
            return messages.sort((a, b) => {
                if (a.createdAt.getTime() == b.createdAt.getTime()) {
                    return 0;
                }
                else if (a.createdAt.getTime() > b.createdAt.getTime()) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
        });
    }
    fetchAndFilter(channel, messagesAmount, filter, options, ...args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.isChannelNullOrUndefined(channel);
            let messages = yield channel.messages.fetch();
            let filteredMessages = new Array();
            let nullMessageFilter = (message) => message != undefined;
            messages = messages.filter(nullMessageFilter);
            messages = messages.filter((message) => {
                return filter(message, args);
            });
            messages.forEach((message) => filteredMessages.push(message));
            if (filteredMessages.length < messagesAmount) {
                while (filteredMessages.length < messagesAmount) {
                    let lastMessageID = yield ((_a = messages.last()) === null || _a === void 0 ? void 0 : _a.id);
                    if (lastMessageID == undefined) {
                        break;
                    }
                    else {
                        messages = yield channel.messages.fetch({
                            limit: this.getChunk(options.chunk, filteredMessages.length),
                            before: lastMessageID
                        });
                        messages.filter((message) => {
                            return nullMessageFilter(message) && filter(message, args);
                        }).forEach((message) => filteredMessages.push(message));
                    }
                }
            }
            if (!options.overflow) {
                return Tools_1.Tools.slice(filteredMessages, messagesAmount);
            }
            return filteredMessages;
        });
    }
    isChannelNullOrUndefined(channel) {
        if (!channel) {
            throw new ArgumentError_1.ArgumentError("Channel cannot be null/undefined in order to fetch messages", "channel");
        }
    }
    getChunk(chunk, iterator) {
        if (!chunk)
            return this.DEFAULT_CHUNK_VALUE;
        else
            return typeof chunk == "function" ? chunk(iterator) : chunk;
    }
}
exports.DiscordObjectGetter = DiscordObjectGetter;
//# sourceMappingURL=DiscordMessageFetcher.js.map