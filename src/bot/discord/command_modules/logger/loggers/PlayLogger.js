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
exports.PlayLogger = void 0;
const Logger_1 = require("../Logger");
const Printer_1 = require("../../../../../console/Printer");
class PlayLogger extends Logger_1.Logger {
    constructor() {
        super("play-logger");
    }
    handle(message) {
        let can;
        if (message.content.substr(1).match(/(leave)/g) ||
            message.content.substr(1).match(/(play)/g) ||
            message.content.substr(1).match(/(next)/g) ||
            message.content.substr(1).match(/(pause)/g) ||
            message.content.substr(1).match(/(resume)/g)) {
            can = true;
            Printer_1.Printer.title("handled by play logger");
            this.work(message);
        }
        else {
            if (this.next) {
                can = this.next.handle(message);
            }
            else {
                can = false;
            }
        }
        return can;
    }
    work(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.player.channel.guild == message.message.guild) {
                this.player.wrapper = message;
                let content = message.content;
                switch (true) {
                    case content.substr(1).match(/(leave)+/g) != null:
                        this.player.leave();
                        Printer_1.Printer.info("Disconnecting play logger");
                        this.disconnect();
                        break;
                    case content.substr(1).match(/(play)+/g) != null:
                        this.player.addToPlaylist();
                        break;
                    case content.substr(1).match(/(next)+/g) != null:
                        this.player.next();
                        break;
                    case content.substr(1).match(/(pause)+/g) != null:
                        this.player.pause();
                        break;
                    case content.substr(1).match(/(resume)+/g) != null:
                        this.player.resume();
                        break;
                }
            }
        });
    }
    logPlayer(player) {
        if (this.player) {
            return new PlayLogger().logPlayer(player);
        }
        else {
            this.logCommand(player);
            this.player = player;
        }
        return this;
    }
}
exports.PlayLogger = PlayLogger;
//# sourceMappingURL=PlayLogger.js.map