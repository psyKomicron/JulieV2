import ytdl = require("ytdl-core-discord");
import { Bot } from "../../Bot";
import
{
    VoiceChannel, VoiceConnection,
    StreamDispatcher
} from "discord.js";
import { YoutubeModule } from '../../command_modules/youtube/YoutubeModule';
import { PlayLogger } from '../../command_modules/logger/loggers/PlayLogger';
import { Printer } from '../../../../console/Printer';
import { CommandSyntaxError } from '../../../../errors/command_errors/CommandSyntaxError';
import { YoutubeOutput } from '../../../../dtos/YoutubeOuput';
import { TokenReader } from '../../../../dal/readers/TokenReader';
import { EmbedFactory } from '../../../../factories/EmbedFactory';
import { Command } from '../Command';
import internal = require("stream");
import { MessageWrapper } from "../../../common/MessageWrapper";
import { Playlist } from "../../command_modules/Playlist";
import { CommandArgumentError } from "../../../../errors/command_errors/CommandArgumentError";
import { Tools } from "../../../../helpers/Tools";
import { Config } from "../../../../dal/Config";

export class PlayCommand extends Command
{
    private static readonly youtubeRegex = /https:\/\/www.youtube.com\/watch\?v=.+/g;
    private playing: boolean = false;
    private playlist: Playlist = new Playlist();
    private timeout: NodeJS.Timeout;
    private _wrapper: MessageWrapper;
    private connection: VoiceConnection;
    private dispacher: StreamDispatcher;
    private voiceChannel: VoiceChannel;
    private stream: internal.Readable;
    private module: YoutubeModule = new YoutubeModule(TokenReader.getToken("youtube"));

    public constructor(bot: Bot)
    {
        super(PlayCommand.name, bot, false);
    }

    public get channel(): VoiceChannel { return this.voiceChannel; }

    public set wrapper(message: MessageWrapper) { this._wrapper = message; }
    public get wrapper() { return this._wrapper; }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        this.wrapper = wrapper;

        await this.setParams(wrapper);

        if (!this.channel) 
        {
            this.voiceChannel = wrapper.message.member.voice.channel;
        }

        Printer.title("play");
        Printer.args(
            [
                "playlist length"
            ],
            [
                this.playlist?.length.toString()
            ]);

        if (this.playlist.length > 0)
        {
            if (this.voiceChannel)
            {
                this.playStream(this.playlist.next());
            }
            else
            {
                throw new CommandArgumentError(this, "No channel to connect to was provided", "voice channel");
            }
        }
        else
        {
            throw new CommandSyntaxError(this, "No songs are in the playlist.");
        }
    }

    public help(wrapper: MessageWrapper): string
    {
        if (!Tools.isNullOrEmpty(wrapper.commandContent))
        {
            let message = "";
            switch (wrapper.commandContent)
            {
                case "u":
                    case "url":
                        message = "The url of a youtube video or playlist (something starting with http://www.youtube.com/watch?v=). If the link has reserved characters like a dash or a quote surround the link with quotes.\nIf the command fail saying the url or keyword is not valued, surround your link with quotes and try again.";
                        message += "\n*This options cannot be used with the keyword option (k or keyword)*";
                        break;
                case "k":
                    case "keyword":
                        message = "Same as if you were typing in the youtube search bar. If the search gives more than one result the bot will send an embed with the results. Use the correct link and type the command again or use it with no args (" + Config.getPrefix() + "help #play for more information)";
                        message += "\n*This options cannot be used with the url option (u or url)*";
                        break;
                case "c":
                    case "channel":
                        message = "Use this option to specify a specific channel to connect to play the audio. You need to give the voice channel ID (right click on the channel, `Copy ID`)";
                        break;
                default:
                    message = "Unrecognized option, look at the help page for a list of available options `" + Config.getPrefix() + "help play`";
                    break;
            }
            return message;
        }
        else 
        {
            return "When you use the command with no options you can give a video url, a playlist url or a keyword. The bot will connect to the same voice channel as the user who used the command, and will play the requested video. You can put multiple links in the command, in that case you need to put a space between each url. Each url will be queue up in the same order as they were in the command.";
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

    public async addToPlaylist(): Promise<void>
    {
        this.setParams(this.wrapper);
    }

    public pause(): void
    {
        if (!this.dispacher.paused)
        {
            this.timeout = setTimeout(() => this.leave(), 180000);
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
        let next = this.playlist.next();
        if (next)
        {
            this.stream.destroy();
            this.playStream(next);
        }
        else 
        {
            this.leave();
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

    private async playStream(url: string): Promise<void>
    {
        if (!this.playing)
        {
            this.connection = await this.join();
            this.bot.logger.addLogger(new PlayLogger().logPlayer(this));
        }

        try
        {
            this.stream = await ytdl(url, { highWaterMark: 1 << 27, filter: "audioonly" });

            this.dispacher = this.connection.play(this.stream, { type: "opus", bitrate: this.voiceChannel.bitrate });

            this.dispacher.on("error", (error) =>
            {
                Printer.error("Dispacher error :\n" + error.toString());
                this.leave();
                this.wrapper.reply("Uh oh... something broke !");
            });

            this.dispacher.on("start", () =>
            {
                this.playing = true;
                this.wrapper.sendToChannel("Playing " + url);
            });

            this.dispacher.on("speaking", (speaking) => { if (!speaking) this.next(); });

        }
        catch (error)
        {
            this.leave();
            Printer.error("Unable to play stream : \n" + error.toString());
        }
    }

    private async searchVideos(keyword: string): Promise<void>
    {
        let searchResult: YoutubeOutput = await this.module.searchVideos(keyword, 1, "fr");

        if (searchResult && searchResult.items.length > 0)
        {
            if (searchResult.items.length == 1)
            {
                let url = searchResult.items[0].videoURL;   
                this.playlist.add(url);

                if (this.playing) // play if not playing
                {
                    this.wrapper.reply("Added song to queue");
                }
            }
            else 
            {
                let embed = EmbedFactory.build({
                    title: "Youtube",
                    description: `Youtube search for \`${keyword}\``
                });

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
                this._wrapper.sendToChannel(embed);
            }
        }
        else
        {
            throw new CommandSyntaxError(this, "Cannot find the requested url");
        }
    }

    private async setParams(wrapper: MessageWrapper): Promise<void>
    {
        // matches command with no arguments, only 1-n links
        if (!wrapper.hasArgs())
        {
            await this.setSimpleParams(wrapper);
        }
        else
        {
            this.setArgParams(wrapper);
        }
    }

    private async setSimpleParams(wrapper: MessageWrapper): Promise<void>
    {
        this.voiceChannel = wrapper.message.member.voice.channel;
        // matches YouTube video link
        if (wrapper.commandContent.match(/^(https:\/\/www.youtube.com\/watch\?v=[A-z0-9-_]+ *){0,}$/g)) 
        {
            let playlist = this.playlist;
            let values = wrapper.content.split(" ");

            for (var i = 0; i < values.length; i++)
            {
                const v = values[i];
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
                    playlist.add(url);
                }
            }
        }
        // matches a YouTube playlist link
        else if (wrapper.commandContent.match(/^https:\/\/www.youtube.com\/playlist\?list=.+/g))
        {
            let results = await this.module.listPlaylistItems(this.module.getPlaylistId(wrapper.commandContent));

            if (results)
            {
                var playlist = this.playlist;
                results.items.forEach(item =>
                { 
                    playlist.add(item.videoURL);
                });
            }
            else 
            {
                throw new CommandSyntaxError(this, "Playlist url is not valid");
            }
        }
        // matches keyword (to initiate a search through the YouTube's API)
        else
        {
            let commandContent = wrapper.commandContent;
            await this.searchVideos(commandContent);
        }
    }

    private setArgParams(wrapper: MessageWrapper): void
    {
        let playlist: Playlist = this.playlist;
        let keyword: string;

        let u = wrapper.getValue(["u", "url"]);
        if (u == undefined)
        {
            throw new CommandArgumentError(this, "Url argument does not have a value (i.e. a link).", "u,url");
        }
        if (u)
        {
            let urls = u.split(" ");
            for (let i = 0; i < urls.length; i++)
            {
                if (urls[i].match(/https:\/\/www.youtube.com\/watch\?v=.+/g))
                {
                    playlist.add(urls[i]);
                }
            }
        }
        else if (wrapper.hasValue(["k", "keyword"]))
        {
            keyword = wrapper.getValue(["k", "keyword"]);
            this.searchVideos(keyword);
        }
        else 
        {
            if (wrapper.hasKeys(["u", "url"]))
            {
                
            }
            else if (wrapper.hasKeys(["k", "keyword"]))
            {
                throw new CommandArgumentError(this, "Keyword argument does not have a value (either a link or a video name)", "k,keyword");
            }
            else 
            {
                throw new CommandSyntaxError(this, "No keyword or url was provided (-k/keyword, -u/url)");
            }
        }

        let c = wrapper.getValue(["c", "channel"]);
        if (c)
        {
            let resChannel = this.resolveChannel(c, wrapper.message.guild.channels);
            if (resChannel && resChannel instanceof VoiceChannel)
            {
                this.voiceChannel = resChannel;
            }
        }
    }
}