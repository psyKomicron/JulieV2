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
exports.TwitterBot = void 0;
const DiscordObjectGetter_1 = require("../common/DiscordObjectGetter");
const Downloader_1 = require("../discord/command_modules/Downloader");
const Printer_1 = require("../../console/Printer");
const Tools_1 = require("../../helpers/Tools");
const Alarm_1 = require("../common/Alarm");
class TwitterBot {
    constructor(bot) {
        this.dog = new DiscordObjectGetter_1.DiscordObjectGetter();
        this.collecting = false;
        bot.on("collect", (channel, setAsDefault, options) => {
            this.onCollect(channel, setAsDefault, options);
        });
    }
    static get(bot) {
        if (!this.instance) {
            this.instance = new TwitterBot(bot);
        }
        return this.instance;
    }
    collect(channel, fromAlarm = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collecting || !channel) {
                return;
            }
            let messages = undefined;
            if (this.fetchMethod == 0) {
                messages = yield this.dog.fetchToday(channel);
            }
            else {
                var filter = (message) => {
                    if (message.attachments.size > 0)
                        return true;
                    else
                        return Tools_1.Tools.isUrl(message.cleanContent);
                };
                messages = yield this.dog.fetchAndFilter(channel, 50, filter, { maxIterations: 200, allowOverflow: false, chunk: Tools_1.Tools.sigmoid });
            }
            let downloader = new Downloader_1.Downloader(channel.name);
            this.collecting = false;
            let urls = new Array();
            messages.forEach((message) => {
                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachement => {
                        urls.push(attachement.url);
                    });
                }
                else {
                    let content = message.content;
                    let match = content.match(Tools_1.Tools.getUrlRegex());
                    if (match != null) {
                        for (var i = 0; i < match.length; i++) {
                            urls.push(match[i]);
                        }
                    }
                }
            });
            Printer_1.Printer.print("Retreived " + urls.length + " urls : ");
            urls.forEach(url => Printer_1.Printer.print("\t" + url));
            yield downloader.download(urls);
            if (fromAlarm) {
                this.collectAlarm.restart();
            }
        });
    }
    setCollectAlarm(alarm) {
        if (!this.collectAlarm) {
            this.collectAlarm = alarm;
        }
        else {
            this.collectAlarm.stop();
            this.collectAlarm = alarm;
        }
    }
    setKeepUntilAlarm(alarm) {
        if (!this.keepUntilAlarm) {
            this.keepUntilAlarm = alarm;
        }
        else {
            this.keepUntilAlarm.stop();
            this.keepUntilAlarm = alarm;
        }
    }
    onCollect(channel, setAsDefault, options) {
        if (setAsDefault) {
            this.collectChannel = channel;
            if (options) {
                if (options.collectWhen) {
                    if (options.collectWhen.getTime() < Date.now()) {
                        options.collectWhen.setDate(options.collectWhen.getDate() + 1);
                    }
                    this.setCollectAlarm(new Alarm_1.Alarm(options.collectWhen));
                }
                if (options.keepUntil) {
                    this.setKeepUntilAlarm(new Alarm_1.Alarm(options.keepUntil, "keep-until alarm", false));
                    this.keepUntilAlarm.on("reachedEnd", name => {
                        Printer_1.Printer.info(name);
                        while (this.collecting)
                            ;
                        this.collectChannel = undefined;
                    });
                }
                this.fetchMethod = options.fetchType >= 0 ? options.fetchType : 0;
            }
            else {
                let now = new Date(Date.now());
                this.setCollectAlarm(new Alarm_1.Alarm(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)));
            }
            if (this.collectAlarm) {
                this.collectAlarm.on("reachedEnd", () => {
                    this.collect(this.collectChannel, true);
                }).start();
            }
        }
        else {
            this.collect(channel);
        }
    }
}
exports.TwitterBot = TwitterBot;
//# sourceMappingURL=TwitterBot.js.map