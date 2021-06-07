import { Printer } from '../../console/Printer';
import { FileSystem } from '../FileSystem';
import { ConfigurationError } from '../../errors/dal_errors/ConfigurationError';
import { EmojiName } from './emojis/EmojiName';
import { LocalEmoji } from './emojis/LocalEmoji';
import { Config } from '../Config';
import { Tools } from '../../helpers/Tools';
import { ArgumentError } from '../../errors/ArgumentError';

export class EmojiReader
{
    //#region messages
    private static readonly fileAbsentMessage: string = "Emoji file does not exist. It needs to be created on the file system for the bot to use reactions.";
    private static readonly jsonReadError: string = "Emoji json file cannot be read properly.";
    //#endregion messages
    private static emojis: Map<string, string>;

    public static init()
    {
        if (FileSystem.exists(Config.getEmojisFilePath()))
        {
            this.emojis = new Map();
            try
            {
                let json = JSON.parse(FileSystem.readFile(Config.getEmojisFilePath()).toString());

                let emojis = json["emojis"];

                if (emojis && emojis instanceof Array)
                {
                    for (var i = 0; i < emojis.length; i++)
                    {
                        let emoji = emojis[i];

                        let name = emoji?.name;
                        let value = emoji?.value;

                        if (Tools.isNullOrEmpty(name) || Tools.isNullOrEmpty(value))
                        {
                            throw new ConfigurationError("Emoji could not be parsed" + Tools.isNullOrEmpty(value) ? "" : " (emoji name : " + name);
                        }

                        this.emojis.set(name, value);
                    }
                }
            }
            catch (error)
            {
                var configError = new ConfigurationError(EmojiReader.jsonReadError);
                error.internalError = error;
                throw configError;
            }
        }
        else
        {
            throw new ConfigurationError(EmojiReader.fileAbsentMessage);
        }
    }

    public static getEmoji<K extends keyof typeof EmojiName>(name: K | number): LocalEmoji
    {
        if (this.emojis)
        {
            let emoji = this.emojis.get(name.toString());
            if (Tools.isNullOrEmpty(emoji))
            {
                throw new ArgumentError("Emoji does not exist", name.toString());
            }
            else
            {
                return new LocalEmoji(name.toString(), emoji);
            }
        }
        else
        {
            throw new ConfigurationError(EmojiReader.name + " has not been instanciated, call EmojiReader.init() to init");
        }
    }
}