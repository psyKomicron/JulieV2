"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarEffect = void 0;
const LoadingEffect_1 = require("./LoadingEffect");
class StarEffect extends LoadingEffect_1.LoadingEffect {
    constructor(position = [0, 0]) {
        super("", ["|", "/", "-", "\\"], 200, position);
    }
}
exports.StarEffect = StarEffect;
//# sourceMappingURL=StarEffect.js.map