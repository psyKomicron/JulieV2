import { Bot } from '../../Bot';
import { Command } from "../Command";
import { Message, MessageEmbed } from 'discord.js';
import { EmojiReader } from '../../../dal/readers/EmojiReader';

export class HelpCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("help", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        let embed = new MessageEmbed()
            .setTitle("You can find all the commands by clicking the link below" + EmojiReader.getEmoji("pointing_down"))
            .setColor(0xff0000)
            .setDescription("Help page for Julie")
            .setURL("https://github.com/psyKomicron/Julie/blob/master/README.md")
            .addFields(
                { name: "Link", value: "https://github.com/psyKomicron/Julie/blob/master/README.md" }
            );
        message.channel.send(embed);
    }
}