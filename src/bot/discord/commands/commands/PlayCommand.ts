import ytdl = require("ytdl-core-discord");
import { Bot } from "../../Bot";
import
{
    VoiceChannel, VoiceConnection,
    StreamDispatcher
} from "discord.js";
import { YoutubeModule } from '../../command_modules/explore/youtube/YoutubeModule';
import { PlayLogger } from '../../command_modules/logger/loggers/PlayLogger';
import { Printer } from '../../../../console/Printer';
import { EmbedResolvable } from '../../../../dtos/EmbedResolvable';
import { CommandSyntaxError } from '../../../../errors/command_errors/CommandSyntaxError';
import { YoutubeOutput } from '../../../../dtos/YoutubeOuput';
import { TokenReader } from '../../../../dal/readers/TokenReader';
import { EmbedFactory } from '../../../../factories/EmbedFactory';
import { Command } from '../Command';
import { ArgumentError } from '../../../../errors/ArgumentError';
import internal = require("stream");
import { CommandError } from "../../../../errors/command_errors/CommandError";
import { MessageWrapper } from "../../../common/MessageWrapper";

export class PlayCommand extends Command
{
    private static readonly youtubeRegex = /https:\/\/www.youtube.com\/watch\?v=.+/g;
    private playing: boolean = false;
    private currentVideo: number = 0;
    private videos: Array<string>;
    private timeout: NodeJS.Timeout;
    private _message: MessageWrapper;
    private connection: VoiceConnection;
    private dispacher: StreamDispatcher;
    private voiceChannel: VoiceChannel;
    private stream: internal.Readable;

    public constructor(bot: Bot)
    {
        super(PlayCommand.name, bot, false);
    }

    public get channel(): VoiceChannel { return this.voiceChannel; }

    public set message(message: MessageWrapper) { this._message = message; }
    public get message() { return this._message; }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        this.message = wrapper;

        let params = this.getParams(wrapper);
        this.videos = params.videos;
        this.voiceChannel = params.channel == undefined ? wrapper.message.member.voice.channel : params.channel;

        Printer.title("play");
        Printer.args(
            [
                "urls provided",
                "keyword" 
            ],
            [
                this.videos?.length.toString(),
                params.keyword 
            ]);

        if (this.videos)
        {
            let match = true;
            this.videos.forEach(url =>
            {
                if (!url.match(PlayCommand.youtubeRegex))
                {
                    match = false;
                }
            });
    
            if (this.videos.length > 0 && match)
            {
                if (this.voiceChannel)
                {
                    this.playStream();
                }
                else
                {
                    throw new CommandError(this, new ArgumentError("No channel to connect to was provided", "voice channel"));
                }
            }
            else
            {
                throw new CommandSyntaxError(this);
            }
        }
        else if (params.keyword)
        {
            this.searchVideos(params.keyword);
        }
    }

    public leave(): void
    {
        this.emit("end");

        if (this.dispacher)
        {
            this.dispacher.end();
            this.dispacher.destroy();
        }

        if (this.connection)
        {
            this.connection.disconnect();
        }
    }

    public addToPlaylist(): void
    {
        let params = this.getParams(this.message);

        if (params.videos)
        {
            let videos = params.videos;
            if (params.videos.length == 1)
            {
                if (videos[0].match(PlayCommand.youtubeRegex))
                {
                    this.videos.push(videos[0]);
                    this.message.reply("Added song to queue");
                }
            }
            else if (videos.length > 1)
            {
                videos.forEach(video =>
                {
                    if (video.match(PlayCommand.youtubeRegex))
                    {
                        this.videos.push(video);
                    }
                });

                this.message.reply("Added " + videos.length + " songs to queue");
            }
        }
        else if (params.keyword)
        {
            this.searchVideos(params.keyword)
                .catch(error => Printer.error(error.toString()));
        }
    }

    public pause(): void
    {
        if (!this.dispacher.paused)
        {
            this.startTimeout();
            this.dispacher.pause(true);
        }
    }

    public resume(): void
    {
        if (this.dispacher.paused)
        {
            clearTimeout(this.timeout);
            this.dispacher.resume();
        }
    }

    public next(): void
    {
        if (this.videos.length > 0 && this.currentVideo + 1 < this.videos.length)
        {
            this.currentVideo++;
            this.stream.destroy();
            this.playStream(this.currentVideo);
        }
        else
        {
            // play poulourt ?
            this.leave();
        }
    }

    private async searchVideos(keyword: string): Promise<void>
    {
        let youtube = new YoutubeModule(TokenReader.getToken("youtube"));
        let searchResult: YoutubeOutput = await youtube.searchVideos(keyword, 10, "fr");

        if (searchResult && searchResult.items.length > 0)
        {
            if (searchResult.items.length == 1)
            {
                let url = searchResult.items[0].videoURL;
                if (!this.videos)
                {
                    this.videos = new Array<string>();
                }
                this.videos.push(url);
                if (!this.playing) // play if not playing
                {
                    this.playStream(0);
                }
            }
            else 
            {
                let embed = EmbedFactory.build(new EmbedResolvable()
                    .setTitle("Youtube")
                    .setDescription(`Youtube search for \`${keyword}\``)
                    .setFooter("made by Julie"));

                for (var i = 0; i < 10 && i < searchResult.items.length; i++)
                {
                    let item = searchResult.items[i];
                    let name = "**" + item.title + "**";
                    let value = item.videoURL;
                    if (name && value)
                    {
                        embed.addField(name, value);
                    }
                }
                embed.setURL(searchResult.items[0].videoURL);
                this._message.send(embed);
            }
        }
        else
        {
            throw new CommandSyntaxError(this, "Cannot find the requested url");
        }
    }

    private async playStream(index: number = 0)
    {
        if (!this.playing)
        {
            this.connection = await this.join();
            this.bot.logger.addLogger(new PlayLogger().logPlayer(this));
        }

        try
        {
            this.stream = await this.createStream(this.videos[index]);
            this.dispacher = this.createDispatcher(this.stream, this.connection);

            this.dispacher.on("error", (error) =>
            {
                Printer.error("Dispacher error :\n" + error.toString());
                this.leave();
                this.message.reply("Uh oh... something broke !");
            });

            this.dispacher.on("start", () =>
            {
                this.playing = true;
                this.message.send(EmbedFactory.build(new EmbedResolvable()
                    .setColor(16711680)
                    .setDescription(this.videos[index])
                    .setFooter("powered by psyKomicron")
                    .setTitle("Playing")));
            });

            this.dispacher.on("speaking", (speaking) =>
            {
                if (!speaking)
                {
                    this.next();
                }
            });

        }
        catch (error)
        {
            this.leave();
            Printer.error(error.toString());
        }
    }

    private getParams(wrapper: MessageWrapper): Params
    {
        // matches command with no arguments, only 1-n links
        if (wrapper.content.match(/^\/play +(https:\/\/www.youtube.com\/watch\?v=.+)+/g)) 
        {
            let params = new Array<string>();
            let values = wrapper.content.split(" ");

            values.forEach(v =>
            {
                if (v.match(PlayCommand.youtubeRegex))
                {
                    let url: string = v;
                    let cleanedUrl = "";
                    for (var i = 0; i < v.length; i++)
                    {
                        if (url[i] != "\"")
                        {
                            cleanedUrl += url[i];
                        }
                    }
                    url = cleanedUrl;
                    params.push(url);
                }
            });
            return { videos: params };
        }
        else if (wrapper.content.match(/^\/play +((?!https:\/\/www.youtube.com\/watch\?v=.+)[A-z0-9]+ *)*/g)) 
        {
            let commandContent = wrapper.commandContent;
            return { keyword: commandContent }
        }
        else
        {
            let videos: Array<string>;
            let channel: VoiceChannel;
            let keyword: string;

            let u = wrapper.getValue(["u", "url"]);
            if (u)
            {
                videos = new Array<string>();
                let urls = u.split(" ");
                for (let i = 0; i < urls.length; i++)
                {
                    if (urls[i].match(/https:\/\/www.youtube.com\/watch\?v=.+/g))
                    {
                        videos.push(urls[i]);
                    }
                }
            }
            else if (wrapper.hasValue(["k", "keyword"]))
            {
                keyword = wrapper.getValue(["k", "keyword"]);
            }
            else 
            {
                throw new CommandSyntaxError(this, "No value was provided (keyword or url)");
            }

            let c = wrapper.getValue(["c", "channel"]);
            if (c)
            {
                let resChannel = this.resolveChannel(c, wrapper.message.guild.channels);
                if (resChannel && resChannel instanceof VoiceChannel)
                {
                    channel = resChannel;
                }
            }

            return { videos: videos, keyword: keyword, channel: channel };
        }
    }

    private async join(): Promise<VoiceConnection>
    {
        let connection: VoiceConnection;
        if (this.voiceChannel.joinable)
        {
            connection = await this.voiceChannel.join();
        }
        return connection;
    }

    private async createStream(url: string): Promise<internal.Readable>
    {
        return await ytdl(url,
            {
                highWaterMark: 1 << 27,
                filter: "audioonly"
            });
    }

    private createDispatcher(stream: internal.Readable, connection: VoiceConnection): StreamDispatcher
    {
        return connection.play(stream,
            {
                type: "opus",
                bitrate: 96000
            });
    }

    private startTimeout(): void
    {
        this.timeout = setTimeout(() => this.leave(), 180000);
    }
}

interface Params
{
    videos?: Array<string>;
    keyword?: string;
    channel?: VoiceChannel;
}