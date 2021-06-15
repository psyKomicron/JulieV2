"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandSyntaxError = void 0;
const ExecutionError_1 = require("../ExecutionError");
class CommandSyntaxError extends ExecutionError_1.ExecutionError {
    constructor(command, message = "Syntax error in the command") {
        super(message, command.name);
    }
}
exports.CommandSyntaxError = CommandSyntaxError;
//# sourceMappingURL=CommandSyntaxError.js.map