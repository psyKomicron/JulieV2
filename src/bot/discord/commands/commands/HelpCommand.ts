import { Bot } from '../../Bot';
import { Command } from '../Command';
import { MessageEmbed } from 'discord.js';
import { EmojiReader } from '../../../../dal/readers/EmojiReader';
import { CommandFactory } from '../../../../factories/CommandFactory';
import { Config } from '../../../../dal/Config';
import { MessageWrapper } from '../../../common/MessageWrapper';
import { Tools } from '../../../../helpers/Tools';

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
            .addField("Link", url);

        wrapper.sendToChannel(embed);
    }

    public help(wrapper: MessageWrapper): string
    {
        if (Tools.isNullOrEmpty(wrapper.commandContent))
        {
            return "Use this command to know more about the options and how to use a specific command. You can also read the help document for this bot at " + Config.getGitRepoPath() + "blob/master/README.md. To get help for a specific command use the following syntax: " + Config.getPrefix() + "`help [command name]` or" + Config.getPrefix() + " `help [command name] [command option]`.";
        }
        else 
        {
            this.execute(wrapper);
            return "👆";
        }
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
        else if (content.substring(i).match(/(life|live|me)/gi) == null)
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