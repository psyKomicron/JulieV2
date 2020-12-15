import ytdl = require('ytdl-core');
import { Bot } from "../../Bot";
import { Command } from "../Command";
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
import { Printer } from '../../../console/Printer';
import { WrongArgumentError } from '../../../errors/command_errors/WrongArgumentError';
import { TokenReader, EmojiReader } from '../../../dal/Readers';
import { EmbedFactory } from '../../../helpers/factories/EmbedFactory';
import { EmbedResolvable } from '../../../viewmodels/EmbedResolvable';
import { CommandSyntaxError } from '../../../errors/command_errors/CommandSyntaxError';
import { YoutubeOutput } from '../../../viewmodels/YoutubeOuput';

export class PlayCommand extends Command
{
    private timeout: NodeJS.Timeout;
    private message: Message;
    private connection: VoiceConnection;
    private dispacher: StreamDispatcher;
    private voiceChannel: VoiceChannel;
    private videos: Array<string> = new Array();
    private currentVideo: number = 0;

    public constructor(bot: Bot)
    {
        super("play-command", bot);
    }

    public get channel(): VoiceChannel { return this.voiceChannel; }

    public async execute(message: Message): Promise<void> 
    {
        this.message = message;
        if (!message.content.match(/([-])/g))
        {
            this.parseMessage(message);
            this.videos = this.getSimpleParams(message.content).videos;
        }
        else
        {
            let params = this.getParams(this.parseMessage(message), message.guild.channels);
            this.voiceChannel = params.channel;
            this.videos = params.videos;
        }

        console.log(Printer.title("play"));
        console.log(Printer.args(["value provided"],
            [
                this.videos.length == 0 ? "" : `${this.videos.length}`,
            ]));
        let match = true;
        this.videos.forEach(url =>
        {
            if (!url.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                match = false;
            }
        })
        if (this.videos.length > 0 && match)
        {
            this.voiceChannel = this.voiceChannel == undefined ? message.member.voice.channel : this.voiceChannel;
            if (this.voiceChannel)
            {
                this.playStream();
            }
            else
            {
                throw new WrongArgumentError(this, "No channel to connect to was provided");
            }
        }
        else if (this.videos)
        {
            let youtube = new YoutubeModule(TokenReader.getToken("youtube"));
            let results = new Array<YoutubeOutput>();
            for (var k = 0; k < this.videos.length; k++)
            {
                await youtube.searchVideos(this.videos[i], 30, "en");
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
                message.reply(embeds[0]);
                for (var n = 1; n < embeds.length; n++)
                {
                    message.channel.send(embeds[n]);
                }
            }
            else
            {
                throw new WrongArgumentError(this, "Cannot find the requested url");
            }
        }
        else
        {
            throw new CommandSyntaxError(this);
        }
    }

    public async join(): Promise<VoiceConnection>
    {
        let connection: VoiceConnection;
        if (this.voiceChannel.joinable)
        {
            connection = await this.voiceChannel.join();
        }
        return connection;
    }

    public leave(): void
    {
        if (this.connection)
        {
            this.dispacher.end();
            this.connection.disconnect();
        }
    }

    public addToPlaylist(message: Message): void
    {
        let videos = this.getSimpleParams(message.content).videos;
        videos.forEach(video =>
        {
            if (video.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                message.reply("Added song to queue");
                this.videos.push(video);
            }
        });
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
            this.playStream(this.currentVideo);
        }
        else
        {
            this.leave();
        }
    }

    private async playStream(index: number = 0)
    {
        this.connection = await this.join();
        this.bot.logger.addLogger(new PlayLogger().logPlayer(this));
        try
        {
            this.dispacher = this.connection.play(ytdl(this.videos[index], { quality: "highestaudio" }));
            this.dispacher.on("error", (error) =>
            {
                console.error(error);
                this.leave();
                this.message.reply("Uh oh... something broke !");
            });
            this.dispacher.on("start", () =>
            {
                this.message.channel.send(EmbedFactory.build(new EmbedResolvable()
                    .setColor(16711680)
                    .setDescription(this.videos[index])
                    .setFooter("powered by psyKomicron")
                    .setTitle("Playing")));
            });
            this.dispacher.on("close", () =>
            {
                this.dispacher.end();
                this.emit("end");
            });
            this.dispacher.on("speaking", (speaking) =>
            {
                if (!speaking)
                {
                    this.next();
                }
                /*else
                {
                    this.leave();
                }*/
            });
        } catch (error)
        {
            this.leave();
            console.log(error);
        }
        finally
        {
            this.deleteMessage(this.message);
        }
    }

    private getSimpleParams(content: string): Params
    {
        let params = new Array<string>();
        let values = content.split(" ");
        values.forEach(v =>
        {
            if (v.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                params.push(v);
            }
        });
        return { videos: params };
    }

    private getParams(args: Map<string, string>, manager: GuildChannelManager): Params
    {
        let videos = new Array<string>();
        let channel: VoiceChannel;
        args.forEach((v, k) => 
        {
            switch (k)
            {
                case "u":
                    let urls = v.split(" ");
                    for (let i = 0; i < urls.length; i++)
                    {
                        if (v.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
                        {
                            videos.push(v);
                        }
                    }
                    break;
                case "c":
                    let c = this.resolveChannel(v, manager);
                    if (c && c instanceof VoiceChannel)
                    {
                        channel = c;
                    }
                default:
            }
        });
        return { videos: videos, channel: channel };
    }

    private startTimeout(): void
    {
        this.timeout = setTimeout(() => this.leave(), 180000);
    }
}

interface Params
{
    channel?: VoiceChannel;
    videos: Array<string>
}