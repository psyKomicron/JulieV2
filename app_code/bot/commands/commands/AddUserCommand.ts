import { Command } from "../Command";
import { Message } from "discord.js";
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
        Printer.title("add-user")

        let users = Config.getAuthorizedUsers();
        
    }
}