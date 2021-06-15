"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedFactory = void 0;
const discord_js_1 = require("discord.js");
const EmojiReader_1 = require("../dal/readers/EmojiReader");
class EmbedFactory {
    static build(resolvable) {
        var _a, _b, _c;
        let messageEmbed = new discord_js_1.MessageEmbed()
            .setTitle(resolvable.title)
            .setColor((_a = resolvable.color) !== null && _a !== void 0 ? _a : Math.floor(Math.random() * 16777215))
            .setDescription(resolvable.description)
            .setFooter((_b = resolvable.footer) !== null && _b !== void 0 ? _b : "made by Julie with " + EmojiReader_1.EmojiReader.getEmoji("heart").value);
        let fields = resolvable.fields;
        if (fields) {
            for (var i = 0; i < fields.length && i < 25; i++) {
                messageEmbed.addField(fields[i].name, fields[i].value, (_c = fields[i]) === null || _c === void 0 ? void 0 : _c.inline);
            }
        }
        return messageEmbed;
    }
}
exports.EmbedFactory = EmbedFactory;
//# sourceMappingURL=EmbedFactory.js.map