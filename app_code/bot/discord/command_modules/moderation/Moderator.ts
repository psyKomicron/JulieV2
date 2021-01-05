import { Message, User, Guild } from "discord.js";
import { Command } from "../../commands/Command";
import { Printer } from "../../../../console/Printer";
import { GuildModerator } from "./guild_mods/GuildModerator";
import { Bot } from "../../../discord/Bot";

export class Moderator extends Command
{
    private static instance: boolean = false;
    private static moderator: Moderator;

    //private tree: Tree;
    private workers: Map<Guild, GuildModerator> = new Map();

    private constructor(bot: Bot)
    {
        super("moderator", bot)
    }

    /**Singleton */
    public static get(bot: Bot): Moderator
    {
        if (!Moderator.instance)
        {
            this.moderator = new Moderator(bot)
        }
        return this.moderator;
    }

    public async execute(message: Message): Promise<void>
    {
        return; // not useful for now, except to slow down the application
        this.parseMessage(message);
        try
        {
            this.handle(message);
        }
        catch (error)
        {
            Printer.error(error.toString());
        }
    }

    public handle(message: Message): void
    {
        let worker = this.workers.get(message.guild);
        if (!worker)
        {
            worker = new GuildModerator(message.guild);
            this.workers.set(message.guild, worker);
        }

        try
        {
            let status = worker.handle(message);
            this.sendMessage(status, message.author);
        }
        catch (error)
        {
            Printer.error(error.toString());
        }
    }

    public sendMessage(status: ResponseStatus, user: User)
    {
        switch (status)
        {
            case ResponseStatus.CLEAN:
                Printer.info("CLEAN");
                break;
            case ResponseStatus.WARN:
                Printer.info("WARNING !");
                break;
            case ResponseStatus.BAN:
                Printer.info("BANNED !");
                break;
        }
    }

    public ban(guild: Guild, user: User): void
    {
        this.workers.get(guild).ban(user);
    }
}

export enum ResponseStatus
{
    CLEAN,
    WARN,
    BAN
}