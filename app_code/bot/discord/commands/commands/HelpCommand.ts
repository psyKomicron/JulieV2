import { Bot } from '../../Bot';
import { Command } from '../Command';
import { MessageEmbed } from 'discord.js';
import { EmojiReader } from '../../../../dal/readers/EmojiReader';
import { CommandFactory } from '../../../../factories/CommandFactory';
import { Config } from '../../../../dal/Config';
import { isNullOrUndefined } from 'util';
import { MessageWrapper } from '../../../common/MessageWrapper';

export class HelpCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("help", bot, false);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        let url = this.getUrl(wrapper);

        let embed = new MessageEmbed()
            .setTitle("Happy to help ! " + EmojiReader.getEmoji("pointing_down").value)
            .setColor(0xff0000)
            .setDescription("Help page")
            .setURL(url)
            .addFields({ name: "Link", value: url });

        wrapper.send(embed);
    }

    private getUrl(wrapper: MessageWrapper): string
    {
        let content = wrapper.content;
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