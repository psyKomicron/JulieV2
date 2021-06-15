"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlarmError = void 0;
const ExecutionError_1 = require("./ExecutionError");
class AlarmError extends ExecutionError_1.ExecutionError {
    constructor(message) {
        super(message, AlarmError.name);
    }
}
exports.AlarmError = AlarmError;
//# sourceMappingURL=AlarmError.js.map