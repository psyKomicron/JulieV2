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
exports.ShowUsersCommand = void 0;
const Config_1 = require("../../../../dal/Config");
const Printer_1 = require("../../../../console/Printer");
const EmbedFactory_1 = require("../../../../factories/EmbedFactory");
const Command_1 = require("../Command");
class ShowUsersCommand extends Command_1.Command {
    constructor(bot) {
        super("show-users", bot, false);
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            Printer_1.Printer.title(this.name);
            let embed = EmbedFactory_1.EmbedFactory.build({
                title: "Authorized users",
                description: "",
                fields: [
                    {
                        name: "Tip",
                        value: "You can add users to the authorized user list with the /adduser (/a, /add) command",
                        inline: false
                    }
                ]
            });
            let users = "";
            Config_1.Config.getAuthorizedUsers().forEach(user => {
                users += "- " + user + "\n";
            });
            embed.addField("Users", users);
            message.reply(embed);
        });
    }
}
exports.ShowUsersCommand = ShowUsersCommand;
//# sourceMappingURL=ShowUsersCommand.js.map