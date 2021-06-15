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
exports.VoteLogger = void 0;
const Logger_1 = require("../Logger");
const Printer_1 = require("../../../../../console/Printer");
const EmojiReader_1 = require("../../../../../dal/readers/EmojiReader");
class VoteLogger extends Logger_1.Logger {
    constructor() {
        super("vote-logger");
    }
    handle(message) {
        let can;
        if (message.content.substr(1, 3) == "end" && this.isID(message.content)) {
            can = true;
            this.work(message);
            Printer_1.Printer.title("handled by vote logger");
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
            let content = message.content;
            let index = content.split(" ")[1];
            if (!Number.isNaN(Number.parseInt(index))) {
                try {
                    this.end(Number.parseInt(index));
                }
                catch (error) {
                    if (error instanceof RangeError) {
                        message.react(EmojiReader_1.EmojiReader.getEmoji("red_cross"));
                        Printer_1.Printer.error(error.toString());
                    }
                }
            }
            message.delete(5000);
        });
    }
    logVote(vote) {
        let id = this.hash(vote.title);
        this.vote = vote;
        this.voteID = id;
        this.logCommand(vote);
        return id;
    }
    isID(content) {
        let index = content.split(" ")[1];
        if (!Number.isNaN(Number.parseInt(index))) {
            let value;
            try {
                value = Number.parseInt(index);
                if (value) {
                    return value == this.voteID;
                }
            }
            catch (error) {
                return false;
            }
        }
        return false;
    }
    end(key) {
        if (key == this.voteID) {
            this.vote.end("User input");
        }
        else {
            throw new RangeError("Key not matching");
        }
    }
    hash(value) {
        let hashAddr = 0;
        for (let counter = 0; counter < value.length; counter++) {
            hashAddr = value.charCodeAt(counter) + (hashAddr << 6) + (hashAddr << 16) - hashAddr;
        }
        return hashAddr;
    }
}
exports.VoteLogger = VoteLogger;
//# sourceMappingURL=VoteLogger.js.map