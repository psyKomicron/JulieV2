"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModerator = void 0;
const Moderator_1 = require("../Moderator");
class GuildModerator {
    constructor(guild, level = 3) {
        this.users = new Map();
        this.guild = guild;
        this._level = level;
    }
    set level(level) { this._level = level; }
    get level() { return this._level; }
    handle(wrapper) {
        let status;
        if (this.users.get(wrapper.message.author) == Moderator_1.ResponseStatus.BAN) {
            status = Moderator_1.ResponseStatus.BAN;
            wrapper.delete(100);
        }
        return status;
    }
    ban(user) {
        this.users.set(user, Moderator_1.ResponseStatus.BAN);
    }
    checkContent(content) {
        let regex = new RegExp(/(qwerty)/g);
        let source = regex.source.replace(/(\(|\))/g, "");
        source += "|iam";
        let pRegex = new RegExp(`/${source}/g`);
    }
}
exports.GuildModerator = GuildModerator;
//# sourceMappingURL=GuildModerator.js.map