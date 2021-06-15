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
exports.MessageWrapper = void 0;
const discord_js_1 = require("discord.js");
const ArgumentError_1 = require("../../errors/ArgumentError");
const Tools_1 = require("../../helpers/Tools");
const BotUser_1 = require("../discord/BotUser");
const ExecutionError_1 = require("../../errors/ExecutionError");
class MessageWrapper {
    constructor(message, commandName) {
        this._isParsed = false;
        this._instanceDate = Date.now();
        this._message = message;
        if (message.author.tag == "psyKomicron#6527") {
            this._user = new BotUser_1.BotUser();
            this._user.isDev = true;
        }
        this.setCommandContent(commandName);
    }
    get isParsed() { return this._isParsed; }
    get message() { return this._message; }
    get commandContent() { return this._commandContent; }
    set commandContent(content) { this._commandContent = content; }
    get content() { return this._message.cleanContent; }
    get args() { return this._parsedArgs; }
    set args(args) { this._parsedArgs = args; }
    get author() { return this._user; }
    get guild() {
        if (this._message.guild.available) {
            return this._message.guild;
        }
        else {
            return undefined;
        }
    }
    get textChannel() {
        if (this._message.channel instanceof discord_js_1.TextChannel) {
            return this._message.channel;
        }
        else {
            return undefined;
        }
    }
    typing() {
        return this.textChannel.typing;
    }
    parseMessage(prefixLength) {
        let content = this.preParseMessage(this.content.substring(prefixLength));
        this._parsedArgs = new Map();
        let i = 0;
        if (content[i] != "-") {
            this._isParsed = true;
            return;
        }
        let maxIterations = 0;
        while (i < content.length && maxIterations < 500) {
            if (content[i] == "-") {
                if (i + 1 != content.length) {
                    let key = "";
                    for (i += 1; i < content.length; i++) {
                        if (this.isChar(content, i)) {
                            key += content[i];
                        }
                        else {
                            i++;
                            break;
                        }
                    }
                    let value = "";
                    if (content[i] != "-") {
                        let comma = false;
                        if (content[i] == "\"") {
                            i++;
                            comma = true;
                        }
                        let marker = true;
                        while (i < content.length && marker && maxIterations < 500) {
                            if (comma && content[i] == "\"") {
                                i++;
                                break;
                            }
                            if (content[i] != " ") {
                                value += content[i];
                            }
                            else if (comma) {
                                value += content[i];
                            }
                            else {
                                marker = false;
                            }
                            if (marker)
                                i++;
                            maxIterations++;
                        }
                    }
                    this._parsedArgs.set(key, value);
                }
            }
            else
                i++;
            maxIterations++;
        }
        if (maxIterations >= 500) {
            throw new ExecutionError_1.ExecutionError("Could not parse message, stopped parsing to avoid overflow (iterations: " + maxIterations + ").", "ExecutionError");
        }
        else {
            this._isParsed = true;
        }
    }
    getValue(keys, ignoreDuplicate = false) {
        if (this._isParsed) {
            let filled = false;
            let res = "";
            for (var i = 0; i < keys.length; i++) {
                let value = this.args.get(keys[i]);
                if (value) {
                    if (ignoreDuplicate) {
                        return value;
                    }
                    else if (!filled) {
                        res = value;
                        filled = true;
                    }
                    else {
                        throw new ArgumentError_1.ArgumentError("Duplicate argument in command", keys[i]);
                    }
                }
            }
            return res;
        }
        else {
            return null;
        }
    }
    get(key) {
        if (this._isParsed) {
            return this._parsedArgs.get(key);
        }
        else {
            return undefined;
        }
    }
    hasValue(keys, interpolate = false) {
        if (this._isParsed) {
            for (var i = 0; i < keys.length; i++) {
                if (!Tools_1.Tools.isNullOrEmpty(keys[i])) {
                    return this._parsedArgs.has(keys[i]);
                }
            }
            return false;
        }
        else {
            return false;
        }
    }
    has(key) {
        if (this._isParsed) {
            return this._parsedArgs.has(key);
        }
        else {
            return false;
        }
    }
    hasKeys(keys) {
        for (var i = 0; i < keys.length; i++) {
            if (this.has(keys[i])) {
                return true;
            }
        }
        return false;
    }
    hasArgs() {
        if (this.isParsed && this.args && this.args.size > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    fetchMember(username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.guild) {
                let res = yield this.guild.members.fetch({ query: username, limit: 1 });
                if (res.size == 1) {
                    return res.array()[0];
                }
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        });
    }
    reply(message) {
        this._message.reply(message);
    }
    react(emoji) {
        this.message.react(emoji.value);
    }
    sendToChannel(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._message.channel.send(message);
        });
    }
    sendToAuthor(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._message.author.send(message);
        });
    }
    delete(timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.message.deletable) {
                if (timeout) {
                    this.message.delete({ timeout: timeout });
                }
                else {
                    this.message.delete();
                }
            }
        });
    }
    type() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.textChannel && !this.typing) {
                yield this.textChannel.startTyping();
            }
        });
    }
    stopTyping() {
        if (this.textChannel && this.typing) {
            this.textChannel.stopTyping(true);
        }
    }
    setCommandContent(commandName) {
        if (this._message) {
            if (commandName) {
                this.commandContent = this.content.substring(commandName.length);
            }
            else {
                let regRes = this.content.match(/\/[a-z]+ /g);
                if (regRes && regRes.length > 0) {
                    this.commandContent = this.content.substring(regRes[0].length);
                }
            }
        }
    }
    preParseMessage(rawContent) {
        let substr = 0;
        while (substr < rawContent.length) {
            if (rawContent[substr] == " ") {
                while (Number.MAX_SAFE_INTEGER && substr < rawContent.length && rawContent[substr] == " ") {
                    substr++;
                }
                break;
            }
            substr++;
        }
        let commas;
        for (var j = 0; j < rawContent.length; j++) {
            if (rawContent[j] == "\"") {
                commas = !commas;
            }
        }
        if (commas) {
            throw new SyntaxError(`Message contains a space, but not incapsulated in \" \" (at character ${j + 1})`);
        }
        this.commandContent = rawContent.substring(substr);
        return this.commandContent;
    }
    isChar(s, i) {
        return (s.codePointAt(i) > 47 && s.codePointAt(i) < 58)
            || (s.codePointAt(i) > 64 && s.codePointAt(i) < 91)
            || (s.codePointAt(i) > 96 && s.codePointAt(i) < 123);
    }
}
exports.MessageWrapper = MessageWrapper;
//# sourceMappingURL=MessageWrapper.js.map