"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionError = void 0;
class ExecutionError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
    get internalError() { return this._internalError; }
    set internalError(error) { this._internalError = error; }
    toString() {
        return this.stack;
    }
}
exports.ExecutionError = ExecutionError;
//# sourceMappingURL=ExecutionError.js.map