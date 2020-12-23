import ytdl = require('ytdl-core');
import { Command } from "../Command";
import { FileType } from '../../../helpers/enums/FileType';
import { Bot } from '../../Bot';
import { Channel, Message, TextChannel, Snowflake, Collection } from 'discord.js';
import { FileSystem as fs } from '../../../dal/FileSystem';
import { EmojiReader } from '../../../dal/readers/EmojiReader';
import { Printer } from '../../../console/Printer';
import { EmbedResolvable } from '../../../viewmodels/EmbedResolvable';
import { EmbedFactory } from '../../../helpers/factories/EmbedFactory';
import { ProgressBar } from '../../../console/effects/ProgressBar';
import { WrongArgumentError } from '../../../errors/command_errors/WrongArgumentError';
import { Downloader } from '../../command_modules/Downloader';
import { CommandSyntaxError } from '../../../errors/command_errors/CommandSyntaxError';

export class DownloadCommand extends Command
{
    private values: Params;

    public constructor(bot: Bot)
    {
        super("download", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        this.values = this.getParams(this.parseMessage(message), message);
        if (!this.values.directDownload)
        {
            let limit = this.values.limit;
            if (limit < 0)
            {
                throw new Error("Given limit is not integer");
            }

            let type = this.values.type;
            let channel = this.values.channel;
            let name = "";

            if (channel instanceof TextChannel)
            {
                name = channel.name;
            }

            message.react(EmojiReader.getEmoji("thinking"));
            Printer.title("initiating download");
            Printer.args(
                ["downloading", "file type", "channel"],
                [`${limit}`, `${type}`, `${name}`]
            );

            if (limit > 250)
            {
                Printer.warn("\n\t/!\\ WARNING : downloading over 250 files can fail /!\\ \n");
                message.react(EmojiReader.getEmoji("warning"));
            }

            this.initiateDownload(limit, channel)
                .then(() =>
                {
                    message.react(EmojiReader.getEmoji("green_check"));
                    this.deleteMessage(message, 2000);
                });
        }
        else
        {
            if (this.values.directDownloadURI)
            {
                this.downloadVideo(message);
            }
            else
            {
                throw new WrongArgumentError(this, "No URI were provided");
            }
        }
    }

    private async downloadVideo(message: Message)
    {
        Printer.title("downloading");
        Printer.args(
            ["downloading"],
            [`${this.values.directDownloadURI}`]
        );
        try
        {
            message.react(EmojiReader.getEmoji("thinking"));
            ytdl(this.values.directDownloadURI, { quality: "highestaudio" })
                .pipe(fs.createWriteStream("./files/downloads/file.mp3", { flags: "w" }))
                .on("finish", () =>
                {
                    Printer.print("Finished downloading file");
                    message.react(EmojiReader.getEmoji("green_check"));
                    this.deleteMessage(message, 3000);

                    let data = new EmbedResolvable();
                    data.setTitle("Youtube")
                    data.setColor(16711680)
                    data.setFooter("powered by psyKomicron")
                    data.setDescription("Video");

                    let embed = EmbedFactory.build(data);
                    embed.attachFiles([{ attachment: fs.readFile("./files/downloads/file.mp3"), name: "file.mp3" }]);
                    // cannot be sent if the bot hasn't Nitro
                    /*this.message.channel.send(embed)
                        .catch(error =>
                        {
                            console.error(error);
                        });*/
                })
                .on("error", (error) =>
                {
                    throw error;
                });
        } catch (error)
        {
            message.react(EmojiReader.getEmoji("red_cross"));
            Printer.error(error.toString());
        }
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
     * /!\ ONLY SUPPORTING PICTURES FOR NOW /!\
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
                let regex =
                    /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                let urls = content.match(regex);
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
    private getParams(map: Map<string, string>, message: Message): Params
    {
        let limit = 50;
        let type = FileType.IMG;
        let channel: Channel;
        let directDownload: boolean = false;
        let directDownloadURI: string;

        if (!Number.isNaN(Number.parseInt(map.get("n"))))
        {
            limit = Number.parseInt(map.get("n"));
        }

        let resolvedChannel = this.resolveTextChannel(map.get("c"), message.guild.channels);
        if (resolvedChannel)
        {
            channel = resolvedChannel;
        }
        else
        {
            channel = message.channel;
        }

        if (map.get("v") && map.get("video"))
        {
            directDownload = true;
            directDownloadURI = map.get("v") ?? map.get("video");
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
        return (Downloader.getFileName(content).endsWith(".png") ||
            Downloader.getFileName(content).endsWith(".PNG") ||
            Downloader.getFileName(content).endsWith(".jpg") ||
            Downloader.getFileName(content).endsWith(".JPG") ||
            Downloader.getFileName(content).endsWith(".gif") ||
            Downloader.getFileName(content).endsWith(".bmp") ||
            Downloader.getFileName(content).endsWith(".BMP") ||
            Downloader.getFileName(content).endsWith(".GIF"));
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