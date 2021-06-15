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
exports.CollectCommand = void 0;
const Command_1 = require("../Command");
const discord_js_1 = require("discord.js");
const Tools_1 = require("../../../../helpers/Tools");
const ArgumentError_1 = require("../../../../errors/ArgumentError");
const CommandArgumentError_1 = require("../../../../errors/command_errors/CommandArgumentError");
class CollectCommand extends Command_1.Command {
    constructor(bot) {
        super(CollectCommand.name, bot);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            if (wrapper.message.channel instanceof discord_js_1.TextChannel) {
                this.bot.emit("collect", wrapper.message.channel, true, this.getParams(wrapper));
            }
            else {
                this.bot.emit("collect", undefined, false);
            }
        });
    }
    parseDate(date) {
        if (Number.isNaN(Date.parse(date))) {
            if (Tools_1.Tools.isDate(date)) {
                let numbers = date.split(":");
                if (Number.isNaN(Number.parseInt(numbers[0])) || Number.isNaN(Number.parseInt(numbers[1]))) {
                    throw new CommandArgumentError_1.CommandArgumentError(this, "Date parameters could not be parsed from the command message", "date");
                }
                else {
                    let h = Number.parseInt(numbers[0]);
                    let m = Number.parseInt(numbers[1]);
                    let now = new Date(Date.now());
                    now.setHours(h);
                    now.setMinutes(m);
                    now.setSeconds(0);
                    now.setMilliseconds(0);
                    return now;
                }
            }
            else {
                throw new CommandArgumentError_1.CommandArgumentError(this, "Date is invalid", "date");
            }
        }
        else {
            return new Date(Date.parse(date));
        }
    }
    getParams(wrapper) {
        let collectWhen;
        let keepUntil;
        let fetchType;
        let when = wrapper.getValue(["when", "w"], false);
        if (!Tools_1.Tools.isNullOrEmpty(when)) {
            collectWhen = this.parseDate(when);
        }
        let until = wrapper.getValue(["keep-until", "k-u"]);
        if (!Tools_1.Tools.isNullOrEmpty(until)) {
            keepUntil = this.parseDate(until);
        }
        let fetch = wrapper.getValue(["n", "fetch-type"]);
        if (!Tools_1.Tools.isNullOrEmpty(fetch)) {
            if (!Number.isNaN(Number.parseInt(fetch))) {
                fetchType = Number.parseInt(fetch);
            }
            else {
                throw new ArgumentError_1.ArgumentError("Fetch type is invalid", "-n or -fetch-type");
            }
        }
        return { collectWhen: collectWhen, keepUntil: keepUntil, fetchType: fetchType };
    }
}
exports.CollectCommand = CollectCommand;
//# sourceMappingURL=CollectCommand.js.map