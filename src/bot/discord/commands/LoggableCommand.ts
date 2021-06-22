import { Guild } from "discord.js";
import { Command } from "./Command";

export abstract class LoggableCommand extends Command
{
    private _guild: Guild;

    public get guild(): Guild { return this._guild; }
    protected set guild(value) { this._guild = value; }
}