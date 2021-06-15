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
exports.RemindUserCommand = void 0;
const Printer_1 = require("../../../../console/Printer");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
const Alarm_1 = require("../../../common/Alarm");
const Command_1 = require("../Command");
class RemindUserCommand extends Command_1.Command {
    constructor(bot) {
        super(RemindUserCommand.name, bot);
    }
    execute(wrapper) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let params = yield this.getParams(wrapper);
            Printer_1.Printer.args(["user", "date", "message"], [(_a = params.user) === null || _a === void 0 ? void 0 : _a.tag, (_b = params.date) === null || _b === void 0 ? void 0 : _b.toUTCString(), params.message]);
            if (params.user && params.date) {
                let alarm = new Alarm_1.Alarm(params.date, "reminding user " + params.user.tag);
                let user = params.user;
                let message = params.message;
                alarm.on("reachedEnd", () => {
                    wrapper.sendToChannel("<@" + user.id + ">, " + message + "\nfrom <@" + wrapper.message.author.id + ">");
                });
                alarm.start();
            }
        });
    }
    getParams(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = { date: undefined, user: undefined, message: undefined };
            if (wrapper.hasArgs()) {
                if (wrapper.hasValue(["u", "user"])) {
                    let username = wrapper.getValue(["u", "user"]);
                    let member = yield wrapper.fetchMember(username);
                    if (member != undefined) {
                        params.user = member.user;
                    }
                }
                if (wrapper.hasValue(["d", "date", "t"])) {
                    let date = wrapper.getValue(["d", "date"]);
                    let now = new Date(Date.now());
                    if (!Number.isNaN(Number.parseInt(date))) {
                        now.setMinutes(now.getMinutes() + Number.parseInt(date));
                        params.date = now;
                    }
                }
                if (wrapper.hasValue(["m", "message", "mess"])) {
                    params.message = wrapper.getValue(["m", "message", "mess"]);
                }
            }
            else {
                let args = wrapper.commandContent.split(",");
                if (args.length >= 2) {
                    let username = args[0];
                    let member = yield wrapper.fetchMember(username);
                    if (member != undefined) {
                        params.user = member.user;
                    }
                    let when = args[1];
                    let now = new Date(Date.now());
                    if (!Number.isNaN(Number.parseInt(when))) {
                        now.setMinutes(now.getMinutes() + Number.parseInt(when));
                        params.date = now;
                    }
                    params.message = wrapper.commandContent.substring(args[0].length + args[1].length + 2);
                }
                else {
                    throw new CommandSyntaxError_1.CommandSyntaxError(this, "Unable to get the user and date (message is optional) from your message. \nIf you are not using the command with tac parameters (-u/user -d/date) separate the values with commas. Look the help page for more information.");
                }
            }
            return params;
        });
    }
}
exports.RemindUserCommand = RemindUserCommand;
//# sourceMappingURL=RemindUserCommand.js.map