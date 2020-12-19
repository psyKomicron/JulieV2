import { Message, User } from "discord.js";
import { GuildModeratorProxy } from "./GuildModeratorProxy";
import { Bot } from "../../Bot";
import { Tree } from "./completion_tree/Tree";
import { Command } from "../../commands/Command";
import { ExecutionError } from "../../../errors/ExecutionError";
import { Printer } from "../../../console/Printer";

export class Moderator extends Command
{
    private static instance: boolean = false;
    private guildModerator: GuildModeratorProxy;
    private tree: Tree;

    private constructor(bot: Bot)
    {
        super("moderator", bot)
        this.guildModerator = new GuildModeratorProxy(this);
    }

    /**Singleton */
    public static get(bot: Bot): Moderator
    {
        if (!Moderator.instance)
        {
            return new Moderator(bot);
        }
        else
        {
            throw new Error("Angel's already here");
        }
    }

    public async execute(message: Message): Promise<void>
    {
        this.parseMessage(message);
        try
        {
            this.guildModerator.handle(message);
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
                console.log(Printer.info("CLEAN"));
                break;
            case ResponseStatus.WARN:
                console.log(Printer.info("WARNING !"));
                break;
            case ResponseStatus.BAN:
                console.log(Printer.info("BANNED !"));
                break;
        }
    }
}

export enum ResponseStatus
{
    CLEAN,
    WARN,
    BAN
}