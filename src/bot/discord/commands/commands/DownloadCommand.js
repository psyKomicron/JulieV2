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
exports.DownloadCommand = void 0;
const FileType_1 = require("../../../../helpers/enums/FileType");
const discord_js_1 = require("discord.js");
const EmojiReader_1 = require("../../../../dal/readers/EmojiReader");
const Printer_1 = require("../../../../console/Printer");
const ProgressBar_1 = require("../../../../console/effects/ProgressBar");
const Downloader_1 = require("../../command_modules/Downloader");
const Command_1 = require("../Command");
const Tools_1 = require("../../../../helpers/Tools");
const CommandArgumentError_1 = require("../../../../errors/command_errors/CommandArgumentError");
class DownloadCommand extends Command_1.Command {
    constructor(bot) {
        super("download", bot, false);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            this.values = this.getParams(wrapper);
            let limit = this.values.limit;
            if (limit < 0) {
                throw new CommandArgumentError_1.CommandArgumentError(this, "Given limit is not integer. Please provide a number of message (to download) greater than 0", "url");
            }
            let type = this.values.type;
            let channel = this.values.channel;
            let name = "";
            if (channel instanceof discord_js_1.TextChannel) {
                name = channel.name;
            }
            wrapper.react(EmojiReader_1.EmojiReader.getEmoji("thinking"));
            Printer_1.Printer.title("initiating download");
            Printer_1.Printer.args(["downloading", "file type", "channel"], [`${limit}`, `${type}`, `${name}`]);
            if (limit > 250) {
                Printer_1.Printer.warn("\n\t/!\\ WARNING : downloading over 250 files can fail /!\\ \n");
                wrapper.react(EmojiReader_1.EmojiReader.getEmoji("warning"));
            }
            this.initiateDownload(limit, channel)
                .then(() => {
                wrapper.react(EmojiReader_1.EmojiReader.getEmoji("green_check"));
                wrapper.delete(2000);
            });
        });
    }
    initiateDownload(numberOfFiles, channel) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let lastMessageID = null;
            let limit = numberOfFiles > 100 ? 100 : numberOfFiles;
            let totalDownloads = 0;
            if (channel instanceof discord_js_1.TextChannel) {
                let messages = yield channel.messages.fetch({ limit: limit });
                let filteredMessages = this.filterMessages(messages);
                let urls = this.hydrateUrls(filteredMessages);
                if (urls.length < numberOfFiles) {
                    let bar = new ProgressBar_1.ProgressBar(numberOfFiles, "fetching urls");
                    bar.start();
                    let reps = 1;
                    while (urls.length < numberOfFiles) {
                        if (reps % 5 == 0 && limit < 100) {
                            reps = 1;
                            limit = Math.floor(limit + (limit * 0.5));
                        }
                        lastMessageID = yield ((_a = messages.last()) === null || _a === void 0 ? void 0 : _a.id);
                        if (lastMessageID == undefined) {
                            break;
                        }
                        else {
                            messages = yield channel.messages.fetch({ limit: limit, before: lastMessageID });
                            filteredMessages = this.filterMessages(messages);
                            let newUrls = this.hydrateUrls(filteredMessages);
                            newUrls.forEach(v => urls.push(v));
                            bar.update(urls.length);
                        }
                        reps++;
                    }
                    bar.stop();
                }
                let copyArray = new Array();
                let downloader = new Downloader_1.Downloader(channel.name);
                for (let i = 0; i < urls.length && i < numberOfFiles; i++, totalDownloads++) {
                    if (urls[i] != undefined) {
                        copyArray.push(urls[i]);
                    }
                }
                downloader.download(copyArray);
            }
        });
    }
    hydrateUrls(urls, type = this.values.type) {
        let filteredUrls = new Array();
        urls.forEach(url => {
            if (type == FileType_1.FileType.IMG) {
                if (this.isImage(url)) {
                    filteredUrls.push(url);
                }
            }
            if (type == FileType_1.FileType.FILE) {
                filteredUrls.push(url);
            }
        });
        return filteredUrls;
    }
    filterMessages(messages, type = FileType_1.FileType.IMG) {
        let filteredArray = new Array();
        messages.forEach((message) => {
            if (message.attachments.size > 0) {
                message.attachments.forEach(attachement => {
                    filteredArray.push(attachement.url);
                });
            }
            else {
                let content = message.content;
                let urls = content.match(Tools_1.Tools.getUrlRegex());
                if (urls != undefined) {
                    for (var i = 0; i < urls.length; i++) {
                        if (this.isImage(urls[i])) {
                            filteredArray.push(urls[i]);
                        }
                    }
                }
            }
        });
        return filteredArray;
    }
    getParams(wrapper) {
        let limit = 50;
        let type = FileType_1.FileType.IMG;
        let channel;
        let directDownload = false;
        let directDownloadURI;
        if (!Number.isNaN(Number.parseInt(wrapper.get("n")))) {
            limit = Number.parseInt(wrapper.get("n"));
        }
        channel = this.resolveTextChannel(wrapper);
        if (wrapper.hasValue(["v", "video"])) {
            directDownload = true;
            directDownloadURI = wrapper.getValue(["v", "video"]);
        }
        return {
            limit: limit,
            type: type,
            channel: channel,
            directDownload: directDownload,
            directDownloadURI: directDownloadURI
        };
    }
    isImage(content) {
        return (Downloader_1.Downloader.getFileName(content).toLowerCase().endsWith(".png")
            || Downloader_1.Downloader.getFileName(content).toLowerCase().endsWith(".jpg")
            || Downloader_1.Downloader.getFileName(content).toLowerCase().endsWith(".gif")
            || Downloader_1.Downloader.getFileName(content).toLowerCase().endsWith(".bmp"));
    }
}
exports.DownloadCommand = DownloadCommand;
//# sourceMappingURL=DownloadCommand.js.map