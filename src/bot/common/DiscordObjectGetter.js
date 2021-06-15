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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordObjectGetter = void 0;
const events_1 = __importDefault(require("events"));
const ArgumentError_1 = require("../../errors/ArgumentError");
const Tools_1 = require("../../helpers/Tools");
class DiscordObjectGetter extends events_1.default {
    constructor() {
        super(...arguments);
        this.DEFAULT_CHUNK_VALUE = 50;
    }
    fetch(channel, messagesAmount, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.isChannelNullOrUndefined(channel);
            let messages = yield channel.messages.fetch();
            let resMessages = new Array();
            let nullMessageFilter = (message) => message != undefined;
            messages = messages.filter(nullMessageFilter);
            messages.forEach((message) => resMessages.push(message));
            if (resMessages.length < messagesAmount) {
                var i = 0;
                while (resMessages.length < messagesAmount && i < options.maxIterations) {
                    let lastMessageID = (_a = messages.last()) === null || _a === void 0 ? void 0 : _a.id;
                    if (lastMessageID == undefined) {
                        break;
                    }
                    else {
                        messages = yield channel.messages.fetch({ limit: this.getChunk(options === null || options === void 0 ? void 0 : options.chunk, i), before: lastMessageID });
                        messages.filter(nullMessageFilter)
                            .forEach((message) => resMessages.push(message));
                        this.emit("progress", resMessages.length);
                    }
                    i++;
                }
            }
            if (!(options === null || options === void 0 ? void 0 : options.allowOverflow)) {
                return Tools_1.Tools.slice(resMessages, messagesAmount);
            }
            return resMessages;
        });
    }
    fetchToday(channel, ignoreList) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.isChannelNullOrUndefined(channel);
            let date = new Date(Date.now());
            var filter = (message, ignoreList, date) => {
                if (ignoreList instanceof Array) {
                    for (var i = 0; i < ignoreList.length; i++) {
                        if (ignoreList[i].id == message.id) {
                            return false;
                        }
                    }
                }
                else if (ignoreList && (ignoreList.id == message.id)) {
                    return false;
                }
                return message.createdAt != undefined
                    && Tools_1.Tools.isSameDay(message.createdAt, date);
            };
            let alive = true;
            let messages = yield channel.messages.fetch();
            let filteredMessages = new Array();
            let nullMessageFilter = (message) => message != undefined;
            messages = messages.filter(nullMessageFilter);
            messages.forEach(message => {
                if (filter(message, ignoreList, date)) {
                    filteredMessages.push(message);
                }
                if (message.createdAt && !Tools_1.Tools.isSameDay(message.createdAt, date)) {
                    alive = false;
                }
            });
            if (alive) {
                let iterations = 0;
                while (alive && iterations < 5000) {
                    let lastMessageID = (_a = messages.last()) === null || _a === void 0 ? void 0 : _a.id;
                    if (lastMessageID == undefined) {
                        break;
                    }
                    else {
                        messages = yield channel.messages.fetch({
                            limit: 100,
                            before: lastMessageID
                        });
                        messages.forEach((message) => {
                            if (nullMessageFilter(message) && filter(message, ignoreList, date)) {
                                filteredMessages.push(message);
                            }
                        });
                    }
                }
            }
            return filteredMessages.sort((a, b) => {
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
            messages.forEach(value => {
                if (filter(value, ...args)) {
                    filteredMessages.push(value);
                }
            });
            if (filteredMessages.length < messagesAmount) {
                let iterations = 0;
                while (filteredMessages.length < messagesAmount && iterations < options.maxIterations) {
                    let lastMessageID = (_a = messages.last()) === null || _a === void 0 ? void 0 : _a.id;
                    if (lastMessageID == undefined) {
                        break;
                    }
                    else {
                        messages = yield channel.messages.fetch({
                            limit: this.getChunk(options.chunk, filteredMessages.length),
                            before: lastMessageID
                        });
                        messages.forEach(value => {
                            if (nullMessageFilter(value) && filter(value, ...args)) {
                                filteredMessages.push(value);
                            }
                        });
                    }
                    iterations++;
                }
            }
            if (!options.allowOverflow) {
                return Tools_1.Tools.slice(filteredMessages, messagesAmount);
            }
            return filteredMessages;
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    isChannelNullOrUndefined(channel) {
        if (!channel) {
            throw new ArgumentError_1.ArgumentError("Channel cannot be null/undefined in order to fetch messages", "channel");
        }
    }
    getChunk(chunk, iterator) {
        if (!chunk) {
            return this.DEFAULT_CHUNK_VALUE;
        }
        else {
            return typeof chunk == "function" ? Math.round(chunk(iterator) * 100) : chunk;
        }
    }
}
exports.DiscordObjectGetter = DiscordObjectGetter;
//# sourceMappingURL=DiscordObjectGetter.js.map