"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTranslater = void 0;
const Config_1 = require("../dal/Config");
const EmbedFactory_1 = require("../factories/EmbedFactory");
const CommandError_1 = require("./command_errors/CommandError");
const CommandSyntaxError_1 = require("./command_errors/CommandSyntaxError");
const ExecutionError_1 = require("./ExecutionError");
class ErrorTranslater {
    translate(error, wrapper) {
        if (wrapper.author.isDev) {
            wrapper.sendToAuthor("```js\n" + error.toString() + "```");
            return EmbedFactory_1.EmbedFactory.build({
                title: "Command failed",
                description: "The last command that you used failed because you did not wrote it properly, you can check the help page to get more information on how to use this command with " + Config_1.Config.getPrefix() + "help"
            });
        }
        else if (error instanceof ExecutionError_1.ExecutionError) {
            if (error instanceof CommandError_1.CommandError) {
                if (error instanceof CommandSyntaxError_1.CommandSyntaxError) {
                    let embed = EmbedFactory_1.EmbedFactory.build({
                        title: "Command failed",
                        description: "The last command that you used failed because you did not wrote it properly, you can check the help page to get more information on how to use this command with " + Config_1.Config.getPrefix() + "help"
                    });
                    embed.addField("Command name", error.name);
                    embed.addField("Command message", error.message);
                    return embed;
                }
                else {
                    let embed = EmbedFactory_1.EmbedFactory.build({
                        title: "Command failed",
                        description: "The last command that you used failed, you can check the help page to get more information on how to use this command with " + Config_1.Config.getPrefix() + "help"
                    });
                    embed.addField("Command name", error.name);
                    return embed;
                }
            }
            else {
                return EmbedFactory_1.EmbedFactory.build({
                    title: "Uh oh, something went wrong...",
                    description: "The last command you used failed, give it a little time I might need to fix it :)"
                });
            }
        }
    }
}
exports.ErrorTranslater = ErrorTranslater;
//# sourceMappingURL=ErrorTranslater.js.map