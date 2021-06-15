"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongYoutubeResponseType = void 0;
const ExecutionError_1 = require("../ExecutionError");
class WrongYoutubeResponseType extends ExecutionError_1.ExecutionError {
    constructor(proxy) {
        super("Wrong return type from youtube", proxy === null || proxy === void 0 ? void 0 : proxy.name);
    }
}
exports.WrongYoutubeResponseType = WrongYoutubeResponseType;
//# sourceMappingURL=WrongYoutubeResponseType.js.map