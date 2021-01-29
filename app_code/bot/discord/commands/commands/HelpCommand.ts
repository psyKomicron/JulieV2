import { Bot } from '../../Bot';
import { Command } from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import { EmojiReader } from '../../../../dal/readers/EmojiReader';
import { CommandFactory } from '../../../../factories/CommandFactory';
import { Config } from '../../../../dal/Config';
import { isNullOrUndefined } from 'util';

export class HelpCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("help", bot, false);
    }

    public async execute(message: Message): Promise<void> 
    {
        let url = this.getUrl(message);
        let embed = new MessageEmbed()
            .setTitle("Happy to help ! " + EmojiReader.getEmoji("pointing_down").value)
            .setColor(0xff0000)
            .setDescription("Help page")
            .setURL(url)
            .addFields(
                { name: "Link", value: url }
            );
        message.channel.send(embed);
    }

    private getUrl(msg: Message): string
    {
        let content = msg.cleanContent;
        let commandName = "";

        for (var i = 1; i < content.length; i++)
        {
            if (content[i] == " ")
            {
                while (content[i] == " ") i++;
                break;
            }
        }


        if (CommandFactory.exist(content.substring(i)))
        {
            commandName = Config.getGitRepoPath() + "blob/master/README.md#" + content.substring(i);
        }
        else if (!isNullOrUndefined(content.substring(i).match(/(life|live|me)/gi)))
        {
            commandName = "https://www.wikihow.com/Live";
        }
        else
        {
            commandName = "https://www.wikihow.com/Main-page";
        }

        return commandName;
    }
}