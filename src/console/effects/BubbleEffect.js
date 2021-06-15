"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BubbleEffect = void 0;
const LoadingEffect_1 = require("./LoadingEffect");
class BubbleEffect extends LoadingEffect_1.LoadingEffect {
    constructor(title) {
        super(title, ["Ooo", "oOo", "ooO"], 300, [0, 0]);
    }
}
exports.BubbleEffect = BubbleEffect;
//# sourceMappingURL=BubbleEffect.js.map