"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedError = void 0;
const ExecutionError_1 = require("./ExecutionError");
class NotImplementedError extends ExecutionError_1.ExecutionError {
    constructor() {
        super("This method has not been implemented yet", "NotImplementedError");
    }
}
exports.NotImplementedError = NotImplementedError;
//# sourceMappingURL=NotImplementedError.js.map