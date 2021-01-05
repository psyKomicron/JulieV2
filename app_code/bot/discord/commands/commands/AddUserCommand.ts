import { Command } from "../Command";
import { Message } from "discord.js";
import { Config } from "../../../../dal/Config";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { CommandError } from "../../../../errors/command_errors/CommandError";

export class AddUserCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("add-user", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        Printer.title("add-user")

        let users = Config.getAuthorizedUsers();
        throw new CommandError("Command not finished yet, give me a some time and try again !", this);
    }
}