"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandError = void 0;
const ExecutionError_1 = require("../ExecutionError");
class CommandError extends ExecutionError_1.ExecutionError {
    constructor(command, message, internalError = null) {
        super(message !== null && message !== void 0 ? message : "Command " + command.name + " failed. Check details below.", command.name);
        this.internalError = internalError;
    }
    toString() {
        if (this.internalError) {
            let internal = this.internalError.toString();
            return super.toString() + "\n\tInternal error:\n" + internal;
        }
        else {
            return super.toString();
        }
    }
}
exports.CommandError = CommandError;
//# sourceMappingURL=CommandError.js.map