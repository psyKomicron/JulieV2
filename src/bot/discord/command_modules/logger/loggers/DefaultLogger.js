"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLogger = void 0;
const Logger_1 = require("../Logger");
class DefaultLogger extends Logger_1.Logger {
    constructor() {
        super("default-logger");
    }
    handle(message) {
        if (this.next) {
            return this.next.handle(message);
        }
        else {
            return false;
        }
    }
    work(message) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Cannot be called on default logger");
        });
    }
}
exports.DefaultLogger = DefaultLogger;
//# sourceMappingURL=DefaultLogger.js.map