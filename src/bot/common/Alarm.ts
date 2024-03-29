import { ArgumentError } from "../../errors/ArgumentError";
import { EventEmitter } from "events";
import { clearInterval } from "timers";
import { AlarmError } from "../../errors/AlarmError";

export class Alarm extends EventEmitter
{
    private readonly minTickRate: number = 250;
    private readonly name: string;
    private started: boolean = false;
    private internalInterval: NodeJS.Timeout;
    private ringingDate: Date;
    private tickInterval: number;
    private autoRestart: boolean;

    /**
     * Creates an alarm.
     * Defaults : autoStart -> false, autoRestart -> true, tickInterval -> 1000ms.
     * @param date When will the alarm set off
     * @param name Friendly name of the alarm
     * @param autoStart Starts the alarm immediatly
     * @param autoRestart Alarm will repeats each time it sets off (default true)
     * @param tickRate How fast will the alarm check if the alarm date is reached in milliseconds (cannot be lower than 250ms)
     */
    public constructor(date: Date, name?: string, autoStart?: boolean, autoRestart?: boolean, tickRate?: number)
    {
        super();
        this.name = name;
        this.ringingDate = date;
        this.autoRestart = autoRestart ?? true;

        if (tickRate)
        {
            if (tickRate >= this.minTickRate)
            {
                this.tickInterval = tickRate;
            }
            else
            {
                throw new ArgumentError(
                    "The given tick interval is too small, please provide an interval of more than "
                    + (this.minTickRate * 1000).toString() + "sec (" + this.minTickRate.toString() + "ms)",
                    "tickInterval");
            }
        }
        else
        {
            this.tickInterval = 1000;
        }

        if (autoStart)
        {
            this.start();
        }
    }

    public on<K extends keyof AlarmEvents>(event: K, listener: (...args: AlarmEvents[K]) => void): this
    {
        return super.on(event, listener);
    }

    public emit<K extends keyof AlarmEvents>(event: K, ...args: AlarmEvents[K]): boolean
    {
        return super.emit(event, args);
    }

    /**Start the alarm */
    public start(): void
    {
        if (!this.started)
        {
            this.internalInterval = setInterval(() => this.checkTime(), this.tickInterval);
            this.started = true;
        }
        else
        {
            clearInterval(this.internalInterval);
            throw new AlarmError("Alarm has already been started, use reset() to restart the alarm instead");
        }
    }

    /**Stops the alarm. It will not restart if no call to start is made again. */
    public stop(): void
    {
        clearInterval(this.internalInterval);
        this.started = false;
    }

    /**Restarts the alarm (reschedule alarm for next day) */
    public restart(): void
    {
        this.ringingDate.setDate(this.ringingDate.getDate() + 1);
    }

    private checkTime(): void
    {
        let now = new Date(Date.now());

        if (now.getDate() == this.ringingDate.getDate() &&
            now.getHours() == this.ringingDate.getHours() &&
            now.getMinutes() == this.ringingDate.getMinutes() &&
            now.getSeconds() == this.ringingDate.getSeconds())
        {
            this.emit("reachedEnd", this.name, this.ringingDate);
            if (this.autoRestart)
            {
                this.restart();
            }
            else
            {
                this.stop();
            }
        }
    }
}

export interface AlarmEvents
{
    reachedEnd: [string?, Date?]; // hold the name of this alarm
}