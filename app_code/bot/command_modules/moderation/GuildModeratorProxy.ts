import { Message, Guild, User } from "discord.js";
import { Moderator } from "./Moderator";
import { GuildModerator } from "./guild_mods/GuildModerator";
import { ExecutionError } from "../../../errors/ExecutionError";
import { Printer } from "../../../console/Printer";

export class GuildModeratorProxy
{
    private moderator: Moderator;
    private workers: Map<Guild, GuildModerator> = new Map();

    public constructor(mod: Moderator)
    {
        this.moderator = mod;
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
            this.moderator.sendMessage(status, message.author);
        } catch (error)
        {
            Printer.error(error.toString());
        }
    }

    public ban(guild: Guild, user: User): void
    {
        this.workers.get(guild).ban(user);
    }
}