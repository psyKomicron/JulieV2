import { Command } from "../Command";
import { Config } from "../../../../dal/Config";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { MessageWrapper } from "../../../common/MessageWrapper";
import { CommandError } from "../../../../errors/command_errors/CommandError";

export class AddUserCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("add-user", bot);
    }

    public async execute(message: MessageWrapper): Promise<void> 
    {
        Printer.title("add-user")

        throw new CommandError(this, undefined, "Command not finished yet, give me a some time and try again !");
        let users = Config.getAuthorizedUsers();
        Config.addAuthorizedUser(this.bot.client.user);
    }
}