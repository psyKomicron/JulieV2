"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCommand = void 0;
const ytdl = require("ytdl-core-discord");
const discord_js_1 = require("discord.js");
const YoutubeModule_1 = require("../../command_modules/youtube/YoutubeModule");
const PlayLogger_1 = require("../../command_modules/logger/loggers/PlayLogger");
const Printer_1 = require("../../../../console/Printer");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
const TokenReader_1 = require("../../../../dal/readers/TokenReader");
const EmbedFactory_1 = require("../../../../factories/EmbedFactory");
const Command_1 = require("../Command");
const Playlist_1 = require("../../command_modules/Playlist");
const CommandArgumentError_1 = require("../../../../errors/command_errors/CommandArgumentError");
class PlayCommand extends Command_1.Command {
    constructor(bot) {
        super(PlayCommand.name, bot, false);
        this.playing = false;
        this.playlist = new Playlist_1.Playlist();
        this.module = new YoutubeModule_1.YoutubeModule(TokenReader_1.TokenReader.getToken("youtube"));
    }
    get channel() { return this.voiceChannel; }
    set wrapper(message) { this._wrapper = message; }
    get wrapper() { return this._wrapper; }
    execute(wrapper) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.wrapper = wrapper;
            yield this.setParams(wrapper);
            if (!this.channel) {
                this.voiceChannel = wrapper.message.member.voice.channel;
            }
            Printer_1.Printer.title("play");
            Printer_1.Printer.args([
                "playlist length"
            ], [
                (_a = this.playlist) === null || _a === void 0 ? void 0 : _a.length.toString()
            ]);
            if (this.playlist.length > 0) {
                if (this.voiceChannel) {
                    this.playStream(this.playlist.next());
                }
                else {
                    throw new CommandArgumentError_1.CommandArgumentError(this, "No channel to connect to was provided", "voice channel");
                }
            }
            else {
                throw new CommandSyntaxError_1.CommandSyntaxError(this, "No songs are in the playlist.");
            }
        });
    }
    leave() {
        this.emit("end");
        if (this.dispacher) {
            this.dispacher.end();
            this.dispacher.destroy();
        }
        if (this.connection) {
            this.connection.disconnect();
        }
    }
    addToPlaylist() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setParams(this.wrapper);
        });
    }
    pause() {
        if (!this.dispacher.paused) {
            this.timeout = setTimeout(() => this.leave(), 180000);
            this.dispacher.pause(true);
        }
    }
    resume() {
        if (this.dispacher.paused) {
            clearTimeout(this.timeout);
            this.dispacher.resume();
        }
    }
    next() {
        let next = this.playlist.next();
        if (next) {
            this.stream.destroy();
            this.playStream(next);
        }
        else {
            this.leave();
        }
    }
    join() {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            if (this.voiceChannel.joinable) {
                connection = yield this.voiceChannel.join();
            }
            return connection;
        });
    }
    playStream(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.playing) {
                this.connection = yield this.join();
                this.bot.logger.addLogger(new PlayLogger_1.PlayLogger().logPlayer(this));
            }
            try {
                this.stream = yield ytdl(url, { highWaterMark: 1 << 27, filter: "audioonly" });
                this.dispacher = this.connection.play(this.stream, { type: "opus", bitrate: 96000 });
                this.dispacher.on("error", (error) => {
                    Printer_1.Printer.error("Dispacher error :\n" + error.toString());
                    this.leave();
                    this.wrapper.reply("Uh oh... something broke !");
                });
                this.dispacher.on("start", () => {
                    this.playing = true;
                    this.wrapper.sendToChannel("Playing " + url);
                });
                this.dispacher.on("speaking", (speaking) => { if (!speaking)
                    this.next(); });
            }
            catch (error) {
                this.leave();
                Printer_1.Printer.error("Unable to play stream : \n" + error.toString());
            }
        });
    }
    searchVideos(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchResult = yield this.module.searchVideos(keyword, 1, "fr");
            if (searchResult && searchResult.items.length > 0) {
                if (searchResult.items.length == 1) {
                    let url = searchResult.items[0].videoURL;
                    this.playlist.add(url);
                    if (this.playing) {
                        this.wrapper.reply("Added song to queue");
                    }
                }
                else {
                    let embed = EmbedFactory_1.EmbedFactory.build({
                        title: "Youtube",
                        description: `Youtube search for \`${keyword}\``
                    });
                    for (var i = 0; i < 10 && i < searchResult.items.length; i++) {
                        let item = searchResult.items[i];
                        let name = "**" + item.title + "**";
                        let value = item.videoURL;
                        if (name && value) {
                            embed.addField(name, value);
                        }
                    }
                    embed.setURL(searchResult.items[0].videoURL);
                    this._wrapper.sendToChannel(embed);
                }
            }
            else {
                throw new CommandSyntaxError_1.CommandSyntaxError(this, "Cannot find the requested url");
            }
        });
    }
    setParams(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!wrapper.hasArgs()) {
                yield this.setSimpleParams(wrapper);
            }
            else {
                this.setArgParams(wrapper);
            }
        });
    }
    setSimpleParams(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceChannel = wrapper.message.member.voice.channel;
            if (wrapper.commandContent.match(/^(https:\/\/www.youtube.com\/watch\?v=[A-z0-9-_]+ *){0,}$/g)) {
                let playlist = this.playlist;
                let values = wrapper.content.split(" ");
                for (var i = 0; i < values.length; i++) {
                    const v = values[i];
                    if (v.match(PlayCommand.youtubeRegex)) {
                        let url = v;
                        let cleanedUrl = "";
                        for (var i = 0; i < v.length; i++) {
                            if (url[i] != "\"") {
                                cleanedUrl += url[i];
                            }
                        }
                        url = cleanedUrl;
                        playlist.add(url);
                    }
                }
            }
            else if (wrapper.commandContent.match(/^https:\/\/www.youtube.com\/playlist\?list=.+/g)) {
                let results = yield this.module.listPlaylistItems(this.module.getPlaylistId(wrapper.commandContent));
                if (results) {
                    var playlist = this.playlist;
                    results.items.forEach(item => {
                        playlist.add(item.videoURL);
                    });
                }
                else {
                    throw new CommandSyntaxError_1.CommandSyntaxError(this, "Playlist url is not valid");
                }
            }
            else {
                let commandContent = wrapper.commandContent;
                yield this.searchVideos(commandContent);
            }
        });
    }
    setArgParams(wrapper) {
        let playlist = this.playlist;
        let channel;
        let keyword;
        let u = wrapper.getValue(["u", "url"]);
        if (u) {
            let urls = u.split(" ");
            for (let i = 0; i < urls.length; i++) {
                if (urls[i].match(/https:\/\/www.youtube.com\/watch\?v=.+/g)) {
                    playlist.add(urls[i]);
                }
            }
        }
        else if (wrapper.hasValue(["k", "keyword"])) {
            keyword = wrapper.getValue(["k", "keyword"]);
            this.searchVideos(keyword);
        }
        else {
            throw new CommandSyntaxError_1.CommandSyntaxError(this, "No value was provided (keyword or url)");
        }
        let c = wrapper.getValue(["c", "channel"]);
        if (c) {
            let resChannel = this.resolveChannel(c, wrapper.message.guild.channels);
            if (resChannel && resChannel instanceof discord_js_1.VoiceChannel) {
                this.voiceChannel = resChannel;
            }
        }
    }
}
exports.PlayCommand = PlayCommand;
PlayCommand.youtubeRegex = /https:\/\/www.youtube.com\/watch\?v=.+/g;
//# sourceMappingURL=PlayCommand.js.map