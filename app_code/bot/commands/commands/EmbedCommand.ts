import { Bot } from '../../Bot';
import { Command } from '../Command';
import { Downloader } from '../../command_modules/Downloader';
import { Printer } from '../../../console/Printer';
import { EmbedFactory } from '../../../helpers/factories/EmbedFactory';
import { FileSystem as fs } from '../../../dal/FileSystem';
import { Message, TextChannel, GuildChannelManager, Channel } from 'discord.js';

export class EmbedCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("embed builder", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        let values = this.getParams(this.parseMessage(message), message.channel, message.guild.channels);
        if (values[0] == undefined)
        {
            throw "Channel cannot be resolved";
        }
        // 1 -get & download file
        // 2 -check message & parse
        let fileUrl: string;
        message.attachments.forEach(value =>
        {
            if (value.url.endsWith(".json")) fileUrl = value.url;
        });
        if (fileUrl)
        {
            let jsonName = Downloader.getFileName(fileUrl);
            console.log(Printer.args(
                ["json file name", "json file url", "delete after execution", "channel"],
                [`${jsonName}`, `${fileUrl}`, `${values[1]}`, `${values[0].name}`]
            ));
            let downloader = new Downloader(this.name);
            await downloader.download([fileUrl]);
            setTimeout(() =>
            {
                let fileContent = fs.readFile(`${downloader.path}${jsonName}`).toString();
                try
                {
                    let json = JSON.parse(fileContent);
                    Printer.clearPrint("Object has all required properties", [0, -2]);
                    console.log();
                    let discordEmbed = EmbedFactory.build(json); // throw TypeError
                    values[0].send(discordEmbed);
                }
                catch (error)
                {
                    if (error instanceof Error)
                    {
                        if (error.message == "Cannot use object")
                        {
                            Printer.clearPrint("", [0, -1]);
                            console.error(Printer.error(error.message));
                        }
                    }
                    else
                    {
                        console.error(error);
                    }
                }
                finally
                {
                    // removing the used json file
                    fs.unlink(`${downloader.path}${jsonName}`);
                    // removing the automaticaly generated log file
                    fs.unlink(`${downloader.path}logs.txt`);
                    fs.rmdir(`${downloader.path}`);
                }
            }, 1000);
        }
        else // no url provided
        {
            Printer.args(
                [Printer.pRed("json file url"), "delete after execution"],
                [`${Printer.error(fileUrl)}`, `${values[1]}`]
            );
            throw new Error("No valid uri/url for the json file");
        }
    }

    private getParams(map: Map<string, string>, defaultChannel: Channel, defaultManager: GuildChannelManager): [TextChannel, boolean]
    {
        let willDelete: boolean = false;
        let channel: TextChannel = undefined;

        if (map.get("d"))
        {
            willDelete = true;
        }
        let resolvedChannel = this.resolveTextChannel(map.get("c"), defaultManager);
        if (resolvedChannel)
        {
            channel = resolvedChannel;
        }

        return [channel, willDelete];
    }
}