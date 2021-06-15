"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeprecatedCommandError = void 0;
const ExecutionError_1 = require("../ExecutionError");
class DeprecatedCommandError extends ExecutionError_1.ExecutionError {
    constructor(friendlyName) {
        super("Command is not currently up to date. For now consider not using it until it is updated. :)", friendlyName);
    }
}
exports.DeprecatedCommandError = DeprecatedCommandError;
//# sourceMappingURL=DeprecatedCommandError.js.map