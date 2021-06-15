"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandArgumentError = void 0;
const CommandError_1 = require("./CommandError");
class CommandArgumentError extends CommandError_1.CommandError {
    constructor(command, message, parameterName) {
        super(command, message + "\nParameter name: " + parameterName);
    }
}
exports.CommandArgumentError = CommandArgumentError;
//# sourceMappingURL=CommandArgumentError.js.map