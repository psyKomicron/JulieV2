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
exports.HelpCommand = void 0;
const Command_1 = require("../Command");
const discord_js_1 = require("discord.js");
const EmojiReader_1 = require("../../../../dal/readers/EmojiReader");
const CommandFactory_1 = require("../../../../factories/CommandFactory");
const Config_1 = require("../../../../dal/Config");
class HelpCommand extends Command_1.Command {
    constructor(bot) {
        super("help", bot, false);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.getUrl(wrapper);
            let embed = new discord_js_1.MessageEmbed()
                .setTitle("Happy to help ! " + EmojiReader_1.EmojiReader.getEmoji("pointing_down").value)
                .setColor(0xff0000)
                .setDescription("Help page")
                .setURL(url)
                .addFields({ name: "Link", value: url });
            wrapper.sendToChannel(embed);
        });
    }
    getUrl(wrapper) {
        let content = wrapper.content;
        let commandName = "";
        for (var i = 1; i < content.length; i++) {
            if (content[i] == " ") {
                while (content[i] == " ")
                    i++;
                break;
            }
        }
        if (CommandFactory_1.CommandFactory.exist(content.substring(i))) {
            commandName = Config_1.Config.getGitRepoPath() + "blob/master/README.md#" + content.substring(i);
        }
        else if (content.substring(i).match(/(life|live|me)/gi) == null) {
            commandName = "https://www.wikihow.com/Live";
        }
        else {
            commandName = "https://www.wikihow.com/Main-page";
        }
        return commandName;
    }
}
exports.HelpCommand = HelpCommand;
//# sourceMappingURL=HelpCommand.js.map