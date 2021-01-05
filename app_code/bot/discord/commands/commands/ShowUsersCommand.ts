import { Message, MessageEmbed } from "discord.js";
import { Config } from "../../../../dal/Config";
import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { EmbedFactory } from "../../../../factories/EmbedFactory";
import { EmbedResolvable } from "../../../../dtos/EmbedResolvable";
import { Command } from "../Command";

export class ShowUsersCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("show-users", bot, false);
    }

    public async execute(message: Message): Promise<void> 
    {
        Printer.title(this.name);

        let embed: MessageEmbed = EmbedFactory.build(new EmbedResolvable()
            .setTitle("Authorized users")
            .addField({ name: "Tip", value: "You can add users to the authorized user list with the /adduser (/a, /add) command", inline: false })
        );

        let users = "";
        Config.getAuthorizedUsers().forEach(user =>
        {
            users += "- " + user + "\n";
        });
        embed.addField("Users", users);

        message.reply(embed);
    }

}