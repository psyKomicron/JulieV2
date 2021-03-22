import ytdl = require("ytdl-core-discord");
import { Bot } from "../../Bot";
import
{
    Message, MessageEmbed,
    VoiceChannel, VoiceConnection,
    StreamDispatcher,
    EmbedField,
    GuildChannelManager
} from "discord.js";
import { YoutubeModule } from '../../command_modules/explore/youtube/YoutubeModule';
import { PlayLogger } from '../../command_modules/logger/loggers/PlayLogger';
import { Printer } from '../../../../console/Printer';
import { EmojiReader } from '../../../../dal/readers/EmojiReader';
import { EmbedResolvable } from '../../../../dtos/EmbedResolvable';
import { CommandSyntaxError } from '../../../../errors/command_errors/CommandSyntaxError';
import { YoutubeOutput } from '../../../../dtos/YoutubeOuput';
import { TokenReader } from '../../../../dal/readers/TokenReader';
import { EmbedFactory } from '../../../../factories/EmbedFactory';
import { Command } from '../Command';
import { ArgumentError } from '../../../../errors/ArgumentError';
import { Logger } from "../../command_modules/logger/Logger";
import internal = require("stream");
import { CommandError } from "../../../../errors/command_errors/CommandError";
import { MessageWrapper } from "../../../common/MessageWrapper";

export class PlayCommand extends Command
{
    private playing: boolean = false;
    private currentVideo: number = 0;
    private videos: Array<string> = new Array();
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
        

        Printer.title("play");
        Printer.args(["urls provided"],
            [
                this.videos.length == 0 ? "" : `${this.videos.length}`,
            ]);

        let match = true;
        this.videos.forEach(url =>
        {
            if (!url.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                match = false;
            }
        });

        if (this.videos.length > 0 && match)
        {
            this.voiceChannel = this.voiceChannel == undefined ? wrapper.message.member.voice.channel : this.voiceChannel;
            if (this.voiceChannel)
            {
                this.playStream();
            }
            else
            {
                throw new CommandError(this, new ArgumentError("No channel to connect to was provided", "voice channel"));
            }
        }
        else if (this.videos)
        {
            this.searchVideos()
        }
        else
        {
            throw new CommandSyntaxError(this);
        }
    }

    //#region log methods
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
        let videos = this.getParams(this.message).videos;

        if (videos.length == 1)
        {
            if (videos[0].match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                this.videos.push(videos[0]);
                this.message.reply("Added song to queue");
            }
        }
        else if (videos.length > 1)
        {
            videos.forEach(video =>
            {
                if (video.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
                {
                    this.videos.push(video);
                }
            });
            this.message.reply("Added " + videos.length + " songs to queue");
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

    private async searchVideos(): Promise<void>
    {
        let youtube = new YoutubeModule(TokenReader.getToken("youtube"));

        let results = new Array<YoutubeOutput>();
        for (var k = 0; k < this.videos.length; k++)
        {
            let res = await youtube.searchVideos(this.videos[k], 30, "en");

        }

        if (results.length > 0)
        {
            let embed = EmbedFactory.build(new EmbedResolvable()
                .setColor(16711680)
                .setDescription("Choose wich video to play")
                .setFooter("powered by psyKomicron")
                .setTitle("Videos"));

            let embedFields = new Array<EmbedField>();

            for (var l = 0; l < results.length; l++)
            {
                let items = results[l].items;
                for (var i = 0; i < items.length; i++)
                {
                    let name = `${i + 1}`.split("");
                    let num = "";
                    for (var j = 0; j < name.length; j++)
                    {
                        let index = Number.parseInt(name[j]);
                        num += EmojiReader.getEmoji(index);
                    }
                    embedFields.push((
                        {
                            name: `${num} - ${items[i].title}`,
                            value: items[i].videoURL,
                            inline: false
                        }));
                }
            }

            let embeds = new Array<MessageEmbed>();

            for (var m = 0; m < embedFields.length; m++)
            {
                if ((m % 25) == 0)
                {
                    embeds.push(embed);
                    embed = EmbedFactory.build(new EmbedResolvable()
                        .setColor(16711680)
                        .setDescription("Rest of the videos")
                        .setFooter("powered by psyKomicron")
                        .setTitle("Videos"));
                }
                embed.addField(embedFields[i].name, embedFields[i].value, embedFields[i].inline);
            }

            this.message.reply(embeds[0]);

            for (var n = 1; n < embeds.length; n++)
            {
                this.message.send(embeds[n]);
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

    private getParams(wrapper: MessageWrapper): Params
    {
        if (!wrapper.content.match(/^\/[A-z]+ +-[a-z]+/g))
        {
            let params = new Array<string>();
            let values = wrapper.content.split(" ");

            values.forEach(v =>
            {
                if (v.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
                {
                    let url = v;
                    while (url.match(/"/g))
                    {
                        url = url.replace("\"", "");
                    }
                    params.push(url);
                }
            });
            return { videos: params };
        }
        else
        {
            let videos = new Array<string>();
            let channel: VoiceChannel;

            let u = wrapper.getValue(["u", "url"]);
            if (u)
            {
                let urls = u.split(" ");
                for (let i = 0; i < urls.length; i++)
                {
                    if (urls[i].match(/https:\/\/www.youtube.com\/watch\?v=.+/g))
                    {
                        videos.push(urls[i]);
                    }
                }
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

            return { videos: videos, channel: channel };
        }
    }
}

interface Params
{
    channel?: VoiceChannel;
    videos: Array<string>
}