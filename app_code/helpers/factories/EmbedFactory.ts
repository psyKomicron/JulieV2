import { MessageEmbed } from 'discord.js';
import { EmbedResolvable } from '../../viewmodels/EmbedResolvable';

export class EmbedFactory
{
    public static build(resolvable: EmbedResolvable): MessageEmbed
    {
        let messageEmbed: MessageEmbed = new MessageEmbed()
            .setTitle(resolvable.title)
            .setColor(resolvable.color ?? Math.floor(Math.random() * 16777215))
            .setDescription(resolvable.description)
            .setFooter(resolvable.footer);
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