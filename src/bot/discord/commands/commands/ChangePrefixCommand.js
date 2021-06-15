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
exports.ChangePrefixCommand = void 0;
const Printer_1 = require("../../../../console/Printer");
const Config_1 = require("../../../../dal/Config");
const EmbedFactory_1 = require("../../../../factories/EmbedFactory");
const Command_1 = require("../Command");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
class ChangePrefixCommand extends Command_1.Command {
    constructor(bot) {
        super("change-prefix", bot, true);
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            Printer_1.Printer.title("changing prefix");
            let prefix = undefined;
            let value = message.getValue(["p", "prefix"]);
            if (value.length <= 10 && value.length > 0) {
                prefix = value;
            }
            Printer_1.Printer.args(["prefix"], [prefix]);
            if (prefix) {
                Printer_1.Printer.info("new prefix valid, updating current prefix");
                Config_1.Config.setPrefix(prefix);
                message.reply(EmbedFactory_1.EmbedFactory.build({
                    title: "Command successful, prefix updated.",
                    description: "",
                    fields: [
                        { name: "New prefix : ", value: prefix, inline: true },
                        {
                            name: "Info",
                            value: "You can always change the prefix again. For prefix examples look at the help page (accessible with /help) section \"Prefix\""
                        }
                    ]
                }));
            }
            else {
                Printer_1.Printer.warn("new prefix invalid, not updating current prefix");
                new CommandSyntaxError_1.CommandSyntaxError(this, "New prefix invalid (" + prefix + "), not updating current prefix");
            }
        });
    }
}
exports.ChangePrefixCommand = ChangePrefixCommand;
//# sourceMappingURL=ChangePrefixCommand.js.map