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
exports.TestCommand = void 0;
const Command_1 = require("../Command");
const ArgumentError_1 = require("../../../../errors/ArgumentError");
const ExecutionError_1 = require("../../../../errors/ExecutionError");
const CommandError_1 = require("../../../../errors/command_errors/CommandError");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
const DeprecatedCommandError_1 = require("../../../../errors/command_errors/DeprecatedCommandError");
const EmptyTokenError_1 = require("../../../../errors/dal_errors/EmptyTokenError");
const WrongYoutubeResponseType_1 = require("../../../../errors/dal_errors/WrongYoutubeResponseType");
class TestCommand extends Command_1.Command {
    constructor(bot) {
        super("Test command", bot);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            if (wrapper.hasValue(["e", "error"])) {
                switch (wrapper.getValue(["e", "error"])) {
                    case "arg":
                        throw new ArgumentError_1.ArgumentError("Argument error message", "test string");
                    case "exec":
                        throw new ExecutionError_1.ExecutionError("Execution error", "execution error test string");
                    case "command":
                        throw new CommandError_1.CommandError(this, "This is a test error", new Error("Test error"));
                    case "syntax":
                        throw new CommandSyntaxError_1.CommandSyntaxError(this, "Command error syntax test string");
                    case "depre":
                        throw new DeprecatedCommandError_1.DeprecatedCommandError("Deprecated command error test message");
                    case "token":
                        throw new EmptyTokenError_1.EmptyTokenError("Test token is empty");
                    case "res":
                        throw new WrongYoutubeResponseType_1.WrongYoutubeResponseType(undefined);
                }
            }
            let args = wrapper.args;
            args.forEach((v, k) => {
                console.log(`{"${k}": "${v}"}`);
            });
            wrapper.sendToChannel(this.getTestCommands());
        });
    }
    getTestCommands() {
        return "```\n/download -n 10\n" +
            "/delete -n 2\n" +
            "/delete -n 2 -u\n" +
            "/embed\n" +
            "/explore -k \"discord\" -wiki\n/explore -k \"discord\" -yt\n" +
            "/play -u \"https://www.youtube.com/watch?v=aIHF7u9Wwiw \"\n" +
            "/help" +
            "/vote -r \"Test\"" +
            "/default\n```";
    }
}
exports.TestCommand = TestCommand;
//# sourceMappingURL=TestCommand.js.map