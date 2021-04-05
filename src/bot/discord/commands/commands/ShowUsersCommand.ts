import { Message, MessageEmbed } from "discord.js";
import { Config } from "../../../../dal/Config";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { EmbedFactory } from "../../../../factories/EmbedFactory";
import { EmbedResolvable } from "../../../../dtos/EmbedResolvable";
import { Command } from "../Command";
import { MessageWrapper } from "../../../common/MessageWrapper";

/**
 * @command-prefix su/showusers
 */
export class ShowUsersCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("show-users", bot, false);
    }

    public async execute(message: MessageWrapper): Promise<void> 
    {
        Printer.title(this.name);

        let embed: MessageEmbed = EmbedFactory.build({
            title: "Authorized users",
            description: "",
            fields: [
                { 
                    name: "Tip", 
                    value: "You can add users to the authorized user list with the /adduser (/a, /add) command", 
                    inline: false 
                }]
            });

        let users = "";
        Config.getAuthorizedUsers().forEach(user =>
        {
            users += "- " + user + "\n";
        });
        embed.addField("Users", users);

        message.reply(embed);
    }

}