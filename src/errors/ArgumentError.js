"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentError = void 0;
const ExecutionError_1 = require("./ExecutionError");
class ArgumentError extends ExecutionError_1.ExecutionError {
    constructor(message, parameterName) {
        super(message + "\nParameter name: " + parameterName, ArgumentError.name);
    }
}
exports.ArgumentError = ArgumentError;
//# sourceMappingURL=ArgumentError.js.map