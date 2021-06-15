"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const events_1 = require("events");
const discord_js_1 = require("discord.js");
class Command extends events_1.EventEmitter {
    constructor(name, bot, deleteAfterExecution = true) {
        super();
        Command._commands++;
        this._bot = bot;
        this._name = name;
        this._deleteAfterExecution = deleteAfterExecution;
    }
    static get commands() { return this._commands; }
    get name() { return this._name; }
    get deleteAfterExecution() { return this._deleteAfterExecution; }
    get bot() { return this._bot; }
    resolveTextChannel(wrapper) {
        var _a, _b;
        if (wrapper.args) {
            return (_b = (_a = this.resolveFromID(wrapper.args.get("c"), wrapper.message.guild.channels)) !== null && _a !== void 0 ? _a : this.resolveFromID(wrapper.args.get("channel"), wrapper.message.guild.channels)) !== null && _b !== void 0 ? _b : wrapper.message.channel;
        }
        else {
            return wrapper.message.channel;
        }
    }
    resolveChannel(channelID, manager) {
        let channel;
        let resolvedChannel = manager.resolve(channelID);
        if (resolvedChannel) {
            channel = resolvedChannel;
        }
        return channel;
    }
    static getCommandName(content) {
        let substr = 0;
        let name = "";
        while (substr < 100 && substr < content.length && content[substr] != "-" && content[substr] != " ") {
            name += content[substr];
            substr++;
        }
        return name;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    resolveFromID(channelID, manager) {
        let channel;
        let resolvedChannel = manager.resolve(channelID);
        if (resolvedChannel && resolvedChannel instanceof discord_js_1.TextChannel) {
            channel = resolvedChannel;
        }
        return channel;
    }
}
exports.Command = Command;
Command._commands = 0;
//# sourceMappingURL=Command.js.map