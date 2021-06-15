"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingEffect = void 0;
const readline = require("readline");
class LoadingEffect {
    constructor(title, effects, speed, position) {
        this.title = title;
        this.effects = effects;
        this.effectLength = effects[0].length;
        this.speed = speed;
        this.position = position;
    }
    start() {
        if (this.title != "") {
            console.log(this.title);
        }
        let size = this.effects.length;
        readline.moveCursor(process.stdout, this.position[0], this.position[1]);
        let i = 0;
        this.timeout = setInterval(() => {
            readline.moveCursor(process.stdout, -this.effectLength, 0);
            process.stdout.write(this.effects[i % size]);
            i++;
        }, this.speed);
        return this.timeout;
    }
    stop() {
        clearInterval(this.timeout);
    }
}
exports.LoadingEffect = LoadingEffect;
//# sourceMappingURL=LoadingEffect.js.map