"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(name) {
        this.name = name;
    }
    addLogger(logger) {
        let lastLogger = this;
        while (lastLogger.next != null) {
            lastLogger = lastLogger.next;
        }
        lastLogger.next = logger;
        logger.previous = lastLogger;
        return this;
    }
    disconnect() {
        if (this.previous) {
            this.previous.next = this.next;
        }
        if (this.next) {
            this.next.previous = this.previous;
        }
        return this;
    }
    get next() { return this._next; }
    set next(value) { this._next = value; }
    get previous() { return this._previous; }
    set previous(value) { this._previous = value; }
    logCommand(command) {
        command.on("end", () => {
            this.disconnect();
        });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map