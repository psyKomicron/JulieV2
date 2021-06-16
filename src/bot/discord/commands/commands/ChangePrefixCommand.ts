import { Printer } from "../../../../console/Printer";
import { Config } from "../../../../dal/Config";
import { Bot } from "../../Bot";
import { EmbedFactory } from "../../../../factories/EmbedFactory";
import { Command } from "../Command";
import { CommandSyntaxError } from "../../../../errors/command_errors/CommandSyntaxError";
import { MessageWrapper } from "../../../common/MessageWrapper";
import { Tools } from "../../../../helpers/Tools";

export class ChangePrefixCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("change-prefix", bot, true);
    }

    public async execute(message: MessageWrapper): Promise<void> 
    {
        Printer.title("changing prefix");
        let prefix = undefined;
        let value = message.getValue(["p", "prefix"]);
        if (Tools.isNullOrEmpty(value))
        {
            prefix = message.commandContent;
        }

        if (value.length <= 10 && value.length > 0)
        {
            prefix = value;
        }

        Printer.args(["prefix"], [prefix]);

        if (!prefix.match(/[-\",\[\]]/))
        {
            Printer.info("new prefix valid, updating current prefix");
            Config.setPrefix(prefix);

            message.reply(EmbedFactory.build({
                title: "Command successful, prefix updated.",
                description: "",
                fields : [
                    { name: "New prefix : ", value: prefix, inline: true },
                    {
                        name: "Info",
                        value: "You can always change the prefix again. For prefix examples look at the help page (accessible with `" + prefix + "help`) section \"Prefix\""
                    }
                ]
            }));
        }
        else
        {
            Printer.warn("new prefix invalid, not updating current prefix");
            new CommandSyntaxError(this, "New prefix invalid (" + prefix + "), not updating current prefix");
        }
    }
}