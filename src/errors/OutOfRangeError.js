"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutOfRangeError = void 0;
const ExecutionError_1 = require("./ExecutionError");
class OutOfRangeError extends ExecutionError_1.ExecutionError {
    constructor() {
        super("Index was out of range", "OutOfRangeError");
    }
}
exports.OutOfRangeError = OutOfRangeError;
//# sourceMappingURL=OutOfRangeError.js.map