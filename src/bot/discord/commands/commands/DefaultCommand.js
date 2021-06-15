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
exports.DefaultCommand = void 0;
const Printer_1 = require("../../../../console/Printer");
const Command_1 = require("../Command");
const Config_1 = require("../../../../dal/Config");
class DefaultCommand extends Command_1.Command {
    constructor(bot) {
        super("default", bot);
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            Printer_1.Printer.title("default");
            Printer_1.Printer.writeLog("Unknown command used (message: " + message.content + ")", Printer_1.LogLevels.Warning);
            message.reply("Unknown command! Use " + Config_1.Config.getPrefix() + "help to get the list of available commands.");
        });
    }
}
exports.DefaultCommand = DefaultCommand;
//# sourceMappingURL=DefaultCommand.js.map