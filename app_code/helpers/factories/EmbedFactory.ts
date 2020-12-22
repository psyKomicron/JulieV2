import { MessageEmbed } from 'discord.js';
import { EmbedResolvable } from '../../viewmodels/EmbedResolvable';
import { EmojiReader } from '../../dal/readers/EmojiReader';

export class EmbedFactory
{
    /**
     * Automatically sets footer, color and description to provide a similar look and feel
     * for all embeds sends by the bot.
     * @param resolvable
     */
    public static build(resolvable: EmbedResolvable): MessageEmbed
    {
        let messageEmbed: MessageEmbed = new MessageEmbed()
            .setTitle(resolvable.title)
            .setColor(resolvable.color ?? Math.floor(Math.random() * 16777215))
            .setDescription(resolvable.description ?? "")
            .setFooter(resolvable.footer ?? "made by Julie with " + EmojiReader.getEmoji("heart"));
        let fields = resolvable.fields;
        if (fields)
        {
            for (var i = 0; i < fields.length && i < 25; i++)
            {
                messageEmbed.addField(fields[i].name, fields[i].value, fields[i]?.inline);
            }
        }
        return messageEmbed;
    }
}