"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiReader = void 0;
const FileSystem_1 = require("../FileSystem");
const ConfigurationError_1 = require("../../errors/dal_errors/ConfigurationError");
const LocalEmoji_1 = require("./emojis/LocalEmoji");
const Config_1 = require("../Config");
const Tools_1 = require("../../helpers/Tools");
const ArgumentError_1 = require("../../errors/ArgumentError");
class EmojiReader {
    static init() {
        if (FileSystem_1.FileSystem.exists(Config_1.Config.getEmojisFilePath())) {
            this.emojis = new Map();
            try {
                let json = JSON.parse(FileSystem_1.FileSystem.readFile(Config_1.Config.getEmojisFilePath()).toString());
                let emojis = json["emojis"];
                if (emojis && emojis instanceof Array) {
                    for (var i = 0; i < emojis.length; i++) {
                        let emoji = emojis[i];
                        let name = emoji === null || emoji === void 0 ? void 0 : emoji.name;
                        let value = emoji === null || emoji === void 0 ? void 0 : emoji.value;
                        if (Tools_1.Tools.isNullOrEmpty(name) || Tools_1.Tools.isNullOrEmpty(value)) {
                            throw new ConfigurationError_1.ConfigurationError("Emoji could not be parsed" + Tools_1.Tools.isNullOrEmpty(value) ? "" : " (emoji name : " + name);
                        }
                        this.emojis.set(name, value);
                    }
                }
            }
            catch (error) {
                var configError = new ConfigurationError_1.ConfigurationError(EmojiReader.jsonReadError);
                error.internalError = error;
                throw configError;
            }
        }
        else {
            throw new ConfigurationError_1.ConfigurationError(EmojiReader.fileAbsentMessage);
        }
    }
    static getEmoji(name) {
        if (this.emojis) {
            let emoji = this.emojis.get(name.toString());
            if (Tools_1.Tools.isNullOrEmpty(emoji)) {
                throw new ArgumentError_1.ArgumentError("Emoji does not exist", name.toString());
            }
            else {
                return new LocalEmoji_1.LocalEmoji(name.toString(), emoji);
            }
        }
        else {
            throw new ConfigurationError_1.ConfigurationError(EmojiReader.name + " has not been instanciated, call EmojiReader.init() to init");
        }
    }
}
exports.EmojiReader = EmojiReader;
EmojiReader.fileAbsentMessage = "Emoji file does not exist. It needs to be created on the file system for the bot to use reactions.";
EmojiReader.jsonReadError = "Emoji json file cannot be read properly.";
//# sourceMappingURL=EmojiReader.js.map