import { Command } from "../Command";
import { Message } from "discord.js";
import { FileSystem } from "../../../dal/FileSystem";
import { Config } from "../../../dal/Config";
import { Bot } from "../../Bot";
import { Printer } from "../../../console/Printer";

export class AddUserCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("add-user", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        if (this.checkConfigFile())
        {
            Printer.print("config ok, user addition authorized");
        }
    }

    private checkConfigFile(): boolean
    {
        var stats = FileSystem.getStats(Config.getPath());
        var date = stats.mtime;
        return false;
    }
}