import { FileType } from '../../../../helpers/enums/FileType';
import { Bot } from '../../Bot';
import { Channel, Message, TextChannel, Snowflake, Collection } from 'discord.js';
import { FileSystem as fs } from '../../../../dal/FileSystem';
import { EmojiReader } from '../../../../dal/readers/EmojiReader';
import { Printer } from '../../../../console/Printer';
import { EmbedResolvable } from '../../../../dtos/EmbedResolvable';
import { EmbedFactory } from '../../../../factories/EmbedFactory';
import { ProgressBar } from '../../../../console/effects/ProgressBar';
import { Downloader } from '../../command_modules/Downloader';
import { Command } from '../Command';
import { Tools } from '../../../../helpers/Tools';
import { ArgumentError } from '../../../../errors/ArgumentError';
import { MessageWrapper } from '../../../common/MessageWrapper';
import { CommandError } from '../../../../errors/command_errors/CommandError';

export class DownloadCommand extends Command
{
    private values: Params;

    public constructor(bot: Bot)
    {
        super("download", bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        this.values = this.getParams(wrapper);

        let limit = this.values.limit;
        if (limit < 0)
        {
            throw new CommandError(this,
                new ArgumentError("Given limit is not integer", "url"),
                "Please provide a number of message (to download) greater than 0");
        }

        let type = this.values.type;
        let channel = this.values.channel;
        let name = "";

        if (channel instanceof TextChannel)
        {
            name = channel.name;
        }

        wrapper.react(EmojiReader.getEmoji("thinking"));
        Printer.title("initiating download");
        Printer.args(
            ["downloading", "file type", "channel"],
            [`${limit}`, `${type}`, `${name}`]
        );

        if (limit > 250)
        {
            Printer.warn("\n\t/!\\ WARNING : downloading over 250 files can fail /!\\ \n");
            wrapper.react(EmojiReader.getEmoji("warning"));
        }

        this.initiateDownload(limit, channel)
            .then(() =>
            {
                wrapper.react(EmojiReader.getEmoji("green_check"));
                wrapper.delete(2000);
            });
    }

    private async initiateDownload(numberOfFiles: number, channel: Channel): Promise<void>
    {
        let lastMessageID: Snowflake = null;

        let limit = numberOfFiles > 100 ? 100 : numberOfFiles;
        let totalDownloads: number = 0;
        if (channel instanceof TextChannel)
        {
            let messages = await channel.messages.fetch({ limit: limit });

            let filteredMessages = this.filterMessages(messages);

            let urls = this.hydrateUrls(filteredMessages);

            if (urls.length < numberOfFiles)
            {
                let bar = new ProgressBar(numberOfFiles, "fetching urls");
                bar.start();
                // fetching all requested urls
                let reps = 1;
                while (urls.length < numberOfFiles) 
                {
                    // change limit
                    if (reps % 5 == 0 && limit < 100)
                    {
                        reps = 1;
                        limit = Math.floor(limit + (limit * 0.5));
                    }
                    lastMessageID = await messages.last()?.id;
                    if (lastMessageID == undefined)
                    {
                        break;
                    }
                    else
                    {
                        messages = await channel.messages.fetch({ limit: limit, before: lastMessageID });

                        filteredMessages = this.filterMessages(messages);

                        let newUrls = this.hydrateUrls(filteredMessages);
                        newUrls.forEach(v => urls.push(v));

                        bar.update(urls.length);
                    }
                    reps++;
                }
                bar.stop();
            }
            let copyArray: Array<string> = new Array();
            let downloader = new Downloader(channel.name);
            for (let i: number = 0; i < urls.length && i < numberOfFiles; i++, totalDownloads++)
            {
                if (urls[i] != undefined)
                {
                    copyArray.push(urls[i]);
                }
            }
            downloader.download(copyArray);
        }
    }

    private hydrateUrls(urls: Array<string>, type: FileType = this.values.type): Array<string>
    {
        let filteredUrls = new Array();
        urls.forEach(url =>
        {
            if (type == FileType.IMG) // image files (png, jpg, gif)
            {
                if (this.isImage(url))
                {
                    filteredUrls.push(url);
                }
            }
            if (type == FileType.FILE)
            {
                filteredUrls.push(url);
            }
        });
        return filteredUrls;
    }

    /**
     * Filter the messages looking at their attachements or if they pack a link
     * @param messages messages to filter
     * @param type filter for the messages
     */
    private filterMessages(messages: Collection<string, Message>, type: FileType = FileType.IMG): Array<string>
    {
        let filteredArray = new Array<string>();
        messages.forEach((message) =>
        {
            if (message.attachments.size > 0)
            {
                message.attachments.forEach(attachement =>
                {
                    filteredArray.push(attachement.url);
                });
            }
            else
            {
                let content = message.content;
                let urls = content.match(Tools.getUrlRegex());
                if (urls != undefined)
                {
                    for (var i = 0; i < urls.length; i++)
                    {
                        if (this.isImage(urls[i]))
                        {
                            filteredArray.push(urls[i]);
                        }
                    }
                }
            }
        });
        return filteredArray;
    }

    /**
     * Parse a string array to retrieve necessary infos for 
     * this.initiateDownload method.
     * @param command content to parse (usually a message content)
     */
    private getParams(wrapper: MessageWrapper): Params
    {
        let limit = 50;
        let type = FileType.IMG;
        let channel: Channel;
        let directDownload: boolean = false;
        let directDownloadURI: string;

        if (!Number.isNaN(Number.parseInt(wrapper.get("n"))))
        {
            limit = Number.parseInt(wrapper.get("n"));
        }

        channel = this.resolveTextChannel(wrapper);

        if (wrapper.hasValue(["v", "video"]))
        {
            directDownload = true;
            directDownloadURI = wrapper.getValue(["v", "video"]);
        }

        return {
            limit: limit,
            type: type,
            channel: channel,
            directDownload: directDownload,
            directDownloadURI: directDownloadURI
        };
    }

    private isImage(content: string)
    {
        return (Downloader.getFileName(content).toLowerCase().endsWith(".png")
            || Downloader.getFileName(content).toLowerCase().endsWith(".jpg")
            || Downloader.getFileName(content).toLowerCase().endsWith(".gif")
            || Downloader.getFileName(content).toLowerCase().endsWith(".bmp"));
    }
}

interface Params
{
    limit: number;
    type: FileType;
    channel: Channel;
    directDownload: boolean;
    directDownloadURI: string;
    timeout?: number;
}