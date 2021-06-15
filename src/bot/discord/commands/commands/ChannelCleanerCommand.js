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
exports.ChannelCleanerCommand = void 0;
const Command_1 = require("../Command");
const Printer_1 = require("../../../../console/Printer");
const ProgressBar_1 = require("../../../../console/effects/ProgressBar");
const DiscordObjectGetter_1 = require("../../../common/DiscordObjectGetter");
class ChannelCleanerCommand extends Command_1.Command {
    constructor(bot) {
        super("channel-cleaner", bot, true);
        this.dog = new DiscordObjectGetter_1.DiscordObjectGetter();
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let values = this.getParams(message);
            Printer_1.Printer.title("cleaning channel");
            if (values[1] != undefined) {
                Printer_1.Printer.args(["number of unique messages", "channel"], [`${values[0]}`, `${values[1].name}`]);
                this.cleanChannel(values[1], values[0], message.message);
            }
        });
    }
    cleanChannel(channel, numberPerUser, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let messages = yield this.dog.fetchToday(channel, message);
            let bar = new ProgressBar_1.ProgressBar(messages.length, "cleaning channel [" + channel.name + "]");
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
                                    message[j].delete({ timeout: 100, reason: "Cleaned from channel by bot." })
                                        .catch(error => Printer_1.Printer.error(error.toString()));
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
        });
    }
    hasAnyData(message) {
        let urlRegex = /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        if (message.attachments.size > 0)
            return true;
        else if (message.cleanContent.match(urlRegex) != undefined)
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
        return [maxMessages, channel];
    }
}
exports.ChannelCleanerCommand = ChannelCleanerCommand;
//# sourceMappingURL=ChannelCleanerCommand.js.map