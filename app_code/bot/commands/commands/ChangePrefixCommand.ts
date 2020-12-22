import { Command } from "../Command";
import { Message } from "discord.js";
import { Printer } from "../../../console/Printer";
import { Config } from "../../../dal/Config";
import { CommandError } from "../../../errors/command_errors/CommandError";
import { Bot } from "../../Bot";
import { EmbedFactory } from "../../../helpers/factories/EmbedFactory";
import { EmbedResolvable } from "../../../viewmodels/EmbedResolvable";

export class ChangePrefixCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("change-prefix", bot, true);
    }

    public async execute(message: Message): Promise<void> 
    {
        Printer.title("changing prefix");
        let prefix = undefined;
        this.parseMessage(message).forEach((value, key) =>
        {
            if (key == "u" && value.length <= 10 && value.length > 0)
            {
                prefix = value;
            }
        });

        Printer.args(["prefix"], [prefix]);

        if (prefix)
        {
            Printer.info("new prefix valid, updating current prefix");
            Config.setPrefix(prefix);

            message.reply(EmbedFactory.build(new EmbedResolvable()
                .setTitle("Command successful, prefix updated.")
                .addField({ name: "New prefix : ", value: prefix, inline: true })
                .addField(
                    {
                        name: "Info",
                        value: "You can always change the prefix again. For prefix examples look at the help page (accessible with /help) section \"Prefix\""
                    })
            ));
        }
        else
        {
            Printer.warn("new prefix invalid, not updating current prefix");
            throw new CommandError("New prefix invalid (" + prefix + "), not updating current prefix", this);
        }
    }
}