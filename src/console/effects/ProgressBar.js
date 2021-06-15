"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const readline = require("readline");
const Printer_1 = require("../Printer");
class ProgressBar {
    constructor(max, title) {
        this.lastValue = 0;
        this.started = false;
        this.max = max;
        this.title = title;
    }
    start() {
        if (!this.started) {
            this.started = true;
            readline.cursorTo(process.stdout, 50 - Math.round(this.title.length / 2));
            process.stdout.write(this.title + "\n");
            let bar = "[";
            for (let i = 0; i < 100; i++) {
                bar += " ";
            }
            readline.moveCursor(process.stdout, 106, 0);
            process.stdout.write("]");
            bar += "\n";
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(bar);
        }
        else
            throw new Error("Cannot start bar again");
    }
    update(value) {
        if (this.started) {
            let round = Math.round(((value != undefined ? value : this.lastValue + 1) / this.max) * 100);
            let border = round < 100 ? round : 100;
            readline.moveCursor(process.stdout, 1, -1);
            let progress = "";
            for (var i = 0; i < border; i++) {
                progress += "▮";
            }
            process.stdout.write(`${Printer_1.Printer.pYell(progress)} ${round}%\n`);
            this.lastValue = value;
        }
        else
            throw new Error("Bar has not been started");
    }
    stop() {
        if (this.started) {
            if (this.max != 0) {
                let round = Math.round((this.lastValue / this.max) * 100);
                let border = round < 100 ? round : 100;
                readline.moveCursor(process.stdout, 1, -1);
                let progress = "";
                for (var i = 0; i < border; i++) {
                    progress += "▮";
                }
                process.stdout.write(`${Printer_1.Printer.pGreen(progress)} ${round}%\n`);
            }
        }
        else
            throw new Error("Bar has not been started");
    }
}
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=ProgressBar.js.map