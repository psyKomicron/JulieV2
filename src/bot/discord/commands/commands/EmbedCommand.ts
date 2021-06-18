import { Bot } from '../../Bot';
import { Command } from '../Command';
import { Downloader } from '../../command_modules/Downloader';
import { Printer } from '../../../../console/Printer';
import { EmbedFactory } from '../../../../factories/EmbedFactory';
import { FileSystem as fs } from '../../../../dal/FileSystem';
import { Message, TextChannel} from 'discord.js';
import { ArgumentError } from '../../../../errors/ArgumentError';
import { MessageWrapper } from '../../../common/MessageWrapper';
import { NotImplementedError } from '../../../../errors/NotImplementedError';

export class EmbedCommand extends Command
{
    public constructor(bot: Bot)
    {
        super(EmbedCommand.name, bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        let values = this.getParams(wrapper);
        if (values[0] == undefined)
        {
            throw new ArgumentError("Channel cannot be resolved", "channel");
        }
        // 1 -get & download file
        // 2 -check message & parse
        let fileUrl: string;
        wrapper.message.attachments.forEach(value =>
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

            // wait for the file to be available to read
            setTimeout(() =>
            {
                let fileContent = fs.readFile(`${downloader.path}${jsonName}`).toString();
                try
                {
                    let json = JSON.parse(fileContent);
                    Printer.clearPrint("Object has all required properties", [0, -2]);
                    console.log();
                    let discordEmbed = EmbedFactory.build(json);
                    values[0].send(discordEmbed);
                }
                catch (error)
                {
                    if (error instanceof Error)
                    {
                        if (error.message == "Cannot use object")
                        {
                            Printer.clearPrint("", [0, -1]);
                        }
                    }
                    Printer.error(error.toString());
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

    public help(wrapper: MessageWrapper): string
    {
        throw new NotImplementedError();
    }

    private getParams(wrapper: MessageWrapper): [TextChannel, boolean]
    {
        let willDelete: boolean = false;
        if (wrapper.has("d"))
        {
            willDelete = true;
        }

        let channel = this.resolveTextChannel(wrapper);

        return [channel, willDelete];
    }
}