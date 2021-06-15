"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = void 0;
const ExecutionError_1 = require("../ExecutionError");
class ConfigurationError extends ExecutionError_1.ExecutionError {
    constructor(message) {
        super(message, "ConfigurationError");
    }
}
exports.ConfigurationError = ConfigurationError;
//# sourceMappingURL=ConfigurationError.js.map