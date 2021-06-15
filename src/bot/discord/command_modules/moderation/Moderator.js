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
exports.ResponseStatus = exports.Moderator = void 0;
const Command_1 = require("../../commands/Command");
const Printer_1 = require("../../../../console/Printer");
const GuildModerator_1 = require("./guild_mods/GuildModerator");
class Moderator extends Command_1.Command {
    constructor(bot) {
        super("moderator", bot);
        this.workers = new Map();
    }
    static get(bot) {
        if (!Moderator.instance) {
            this.moderator = new Moderator(bot);
        }
        return this.moderator;
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
            try {
                this.handle(message);
            }
            catch (error) {
                Printer_1.Printer.error(error.toString());
            }
        });
    }
    handle(wrapper) {
        let worker = this.workers.get(wrapper.message.guild);
        if (!worker) {
            worker = new GuildModerator_1.GuildModerator(wrapper.message.guild);
            this.workers.set(wrapper.message.guild, worker);
        }
        try {
            let status = worker.handle(wrapper);
            this.sendMessage(status, wrapper.message.author);
        }
        catch (error) {
            Printer_1.Printer.error(error.toString());
        }
    }
    sendMessage(status, user) {
        switch (status) {
            case ResponseStatus.CLEAN:
                Printer_1.Printer.info("CLEAN");
                break;
            case ResponseStatus.WARN:
                Printer_1.Printer.info("WARNING !");
                break;
            case ResponseStatus.BAN:
                Printer_1.Printer.info("BANNED !");
                break;
        }
    }
    ban(guild, user) {
        this.workers.get(guild).ban(user);
    }
}
exports.Moderator = Moderator;
Moderator.instance = false;
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["CLEAN"] = 0] = "CLEAN";
    ResponseStatus[ResponseStatus["WARN"] = 1] = "WARN";
    ResponseStatus[ResponseStatus["BAN"] = 2] = "BAN";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
//# sourceMappingURL=Moderator.js.map