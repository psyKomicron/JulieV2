"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alarm = void 0;
const ArgumentError_1 = require("../../errors/ArgumentError");
const events_1 = require("events");
const timers_1 = require("timers");
const AlarmError_1 = require("../../errors/AlarmError");
class Alarm extends events_1.EventEmitter {
    constructor(date, name, autoStart, autoRestart, tickInterval) {
        super();
        this.minTickInterval = 250;
        this.started = false;
        this.name = name;
        this.ringingDate = date;
        this.autoRestart = autoRestart !== null && autoRestart !== void 0 ? autoRestart : true;
        if (tickInterval) {
            if (tickInterval >= this.minTickInterval) {
                this.tickInterval = tickInterval;
            }
            else {
                throw new ArgumentError_1.ArgumentError("The given tick interval is too small, please provide an interval of more than "
                    + (this.minTickInterval * 1000).toString() + "sec (" + this.minTickInterval.toString() + "ms)", "tickInterval");
            }
        }
        else {
            this.tickInterval = 1000;
        }
        if (autoStart) {
            this.start();
        }
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, args);
    }
    start() {
        if (!this.started) {
            this.internalInterval = setInterval(() => this.checkTime(), this.tickInterval);
            this.started = true;
        }
        else {
            timers_1.clearInterval(this.internalInterval);
            throw new AlarmError_1.AlarmError("Alarm has already been started, use reset() to restart the alarm instead");
        }
    }
    stop() {
        timers_1.clearInterval(this.internalInterval);
        this.started = false;
    }
    restart() {
        this.ringingDate.setDate(this.ringingDate.getDate() + 1);
    }
    checkTime() {
        let now = new Date(Date.now());
        if (now.getDate() == this.ringingDate.getDate() &&
            now.getHours() == this.ringingDate.getHours() &&
            now.getMinutes() == this.ringingDate.getMinutes() &&
            now.getSeconds() == this.ringingDate.getSeconds()) {
            this.emit("reachedEnd", this.name);
            if (this.autoRestart) {
                this.restart();
            }
            else {
                this.stop();
            }
        }
    }
}
exports.Alarm = Alarm;
//# sourceMappingURL=Alarm.js.map