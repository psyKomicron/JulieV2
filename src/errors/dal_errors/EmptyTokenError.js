"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyTokenError = void 0;
const ExecutionError_1 = require("../ExecutionError");
class EmptyTokenError extends ExecutionError_1.ExecutionError {
    constructor(message) {
        super(message, "EmptyTokenError");
    }
}
exports.EmptyTokenError = EmptyTokenError;
//# sourceMappingURL=EmptyTokenError.js.map