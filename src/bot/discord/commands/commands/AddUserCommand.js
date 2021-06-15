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
exports.AddUserCommand = void 0;
const Command_1 = require("../Command");
const Config_1 = require("../../../../dal/Config");
const Printer_1 = require("../../../../console/Printer");
const CommandError_1 = require("../../../../errors/command_errors/CommandError");
const NotImplementedError_1 = require("../../../../errors/NotImplementedError");
class AddUserCommand extends Command_1.Command {
    constructor(bot) {
        super("add-user", bot);
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            Printer_1.Printer.title("add-user");
            throw new CommandError_1.CommandError(this, "Command not finished yet, give me a some time and try again !", new NotImplementedError_1.NotImplementedError());
            let users = Config_1.Config.getAuthorizedUsers();
            Config_1.Config.addAuthorizedUser(this.bot.client.user);
        });
    }
}
exports.AddUserCommand = AddUserCommand;
//# sourceMappingURL=AddUserCommand.js.map