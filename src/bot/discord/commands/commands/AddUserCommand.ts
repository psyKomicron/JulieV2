import { Command } from "../Command";
import { Config } from "../../../../dal/Config";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { MessageWrapper } from "../../../common/MessageWrapper";
import { CommandError } from "../../../../errors/command_errors/CommandError";
import { NotImplementedError } from "../../../../errors/NotImplementedError";

export class AddUserCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("add-user", bot);
    }

    public async execute(message: MessageWrapper): Promise<void> 
    {
        Printer.title("add-user")

        throw new CommandError(this, "Command not finished yet, give me a some time and try again !", new NotImplementedError());
        let users = Config.getAuthorizedUsers();
        Config.addAuthorizedUser(this.bot.client.user);
    }

    public help(wrapper: MessageWrapper): string
    {
        throw new NotImplementedError();
    }
}