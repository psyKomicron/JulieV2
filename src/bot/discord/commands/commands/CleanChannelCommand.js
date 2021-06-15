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
exports.CleanChannelCommand = void 0;
const Command_1 = require("../Command");
const Printer_1 = require("../../../../console/Printer");
const ProgressBar_1 = require("../../../../console/effects/ProgressBar");
const DiscordObjectGetter_1 = require("../../../common/DiscordObjectGetter");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
const EmojiReader_1 = require("../../../../dal/readers/EmojiReader");
const Tools_1 = require("../../../../helpers/Tools");
const EmbedFactory_1 = require("../../../../factories/EmbedFactory");
const StarEffect_1 = require("../../../../console/effects/StarEffect");
class CleanChannelCommand extends Command_1.Command {
    constructor(bot) {
        super("channel-cleaner", bot, false);
        this.dog = new DiscordObjectGetter_1.DiscordObjectGetter();
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let values = this.getParams(message);
            Printer_1.Printer.title("cleaning channel");
            if (values[1] != undefined) {
                Printer_1.Printer.args(["number of unique messages", "channel"], [`${values[0]}`, `${values[1].name}`]);
                yield this.cleanChannel(message, values[0], values[1], values[2], values[3]);
            }
            else {
                throw new CommandSyntaxError_1.CommandSyntaxError(this, "Missing number per user argument (u)");
            }
        });
    }
    cleanChannel(message, numberPerUser, channel, onlyToday, preview) {
        return __awaiter(this, void 0, void 0, function* () {
            let messages;
            let effect = new StarEffect_1.StarEffect([null, -1]);
            effect.start();
            if (onlyToday) {
                messages = yield this.dog.fetchToday(channel, message.message);
            }
            else {
                messages = yield this.dog.fetch(channel, 300, { maxIterations: 600, chunk: Tools_1.Tools.sigmoid, allowOverflow: false });
            }
            effect.stop();
            if (messages.length == 0) {
                message.react(EmojiReader_1.EmojiReader.getEmoji("warning"));
                Printer_1.Printer.print("No messages found !");
            }
            else {
                let toDelete = new Array();
                let bar = new ProgressBar_1.ProgressBar(messages.length, "fetching messages [" + channel.name + "]");
                bar.start();
                for (var i = 0; i < messages.length; i++) {
                    let message = messages[i];
                    if (!this.hasAnyData(message)) {
                        let messagesByAuthor = new Map();
                        for (var j = i; j < messages.length; j++) {
                            let author = messages[j].author;
                            if (!this.hasAnyData(messages[j])) {
                                if (messagesByAuthor.has(author)) {
                                    messagesByAuthor.set(author, messagesByAuthor.get(author) + 1);
                                    if (messagesByAuthor.get(author) > numberPerUser && messages[j].deletable) {
                                        toDelete.push(messages[j]);
                                    }
                                }
                                else {
                                    messagesByAuthor.set(author, 1);
                                }
                            }
                            else {
                                break;
                            }
                        }
                        i = j;
                    }
                    bar.update(i);
                }
                bar.stop();
                if (preview) {
                    if (toDelete.length != 0) {
                        let embed = EmbedFactory_1.EmbedFactory.build({
                            title: "Clean command preview",
                            description: "List of messages that will be deleted"
                        });
                        let embedField = { name: "Messages", value: "", inline: false };
                        let idArray = new Array();
                        for (i = 0; i < toDelete.length; i++) {
                            const shorten = Printer_1.Printer.shorten(toDelete[i].cleanContent) + "\n";
                            if (embedField.value.length + shorten.length >= 1024) {
                                embed.fields.push(embedField);
                                embedField = { name: "-", value: shorten, inline: true };
                            }
                            else {
                                embedField.value += shorten;
                            }
                            idArray.push(toDelete[i].id);
                        }
                        embed.fields.push(embedField);
                        embedField = { name: "Messages IDs", value: "", inline: false };
                        for (i = 0; i < idArray.length; i++) {
                            if (embedField.value.length + idArray[i].length > 1021) {
                                embed.fields.push(embedField);
                                embedField = { name: "Message IDs", value: "", inline: false };
                            }
                            embedField.value += "`" + idArray[i] + "`,";
                        }
                        embed.fields.push(embedField);
                        try {
                            yield message.sendToChannel(embed);
                        }
                        catch (err) {
                            Printer_1.Printer.error(err.toString());
                            Printer_1.Printer.writeLog("Failed to send embed (clean-channel command). Error " + err.toString(), Printer_1.LogLevels.Error);
                        }
                    }
                    else {
                        message.reply("No messages to delete ! Channel is clean.");
                    }
                }
                else {
                    bar.stop();
                    bar = new ProgressBar_1.ProgressBar(toDelete.length, "deleting messages[" + channel.name + "]");
                    bar.start();
                    for (i = 0; i < toDelete.length; i++) {
                        try {
                            yield messages[i].delete({ timeout: 100, reason: "Cleaned from channel by bot." });
                            bar.update();
                        }
                        catch (error) {
                            Printer_1.Printer.error(error.toString());
                        }
                    }
                    bar.stop();
                }
            }
        });
    }
    hasAnyData(message) {
        if (message.attachments.size > 0)
            return true;
        else if (Tools_1.Tools.isUrl(message.cleanContent))
            return true;
        else
            return false;
    }
    getParams(wrapper) {
        let maxMessages = 3;
        let channel = undefined;
        if (!Number.isNaN(Number.parseInt(wrapper.get("u")))) {
            maxMessages = Number.parseInt(wrapper.get("u"));
        }
        channel = this.resolveTextChannel(wrapper);
        return [maxMessages, channel, !wrapper.hasKeys(["a", "all"]), !wrapper.has("p")];
    }
}
exports.CleanChannelCommand = CleanChannelCommand;
//# sourceMappingURL=CleanChannelCommand.js.map