import { Printer } from '../../console/Printer';
import { FileSystem } from '../FileSystem';
import { ConfigurationError } from '../../errors/dal_errors/ConfigurationError';

export class EmojiReader
{
    private static readonly fileAbsentMessage: string = "Emoji file does not exist. It needs to be created on the file system for the bot to use reactions.";
    private static readonly jsonReadError: string = "Emoji json file cannot be read properly.";

    public static getEmoji(name: "green_check" | "green_cross" | "thinking" | "warning" | "red_cross" | "pointing_down" | "heart" | number): string
    {
        let res = "";

        if (FileSystem.exists("./files/emojis/emojis.json"))
        {
            try
            {
                let json = JSON.parse(FileSystem.readFile("./config/emojis.json").toString());

                let emojis = json["emojis"];

                if (emojis)
                {
                    for (var i = 0; i < emojis.length; i++)
                    {
                        if (emojis[i].name == name)
                        {
                            res = emojis[i].value;
                        }
                    }
                }
            }
            catch (error)
            {
                Printer.error(error.toString());
                throw new ConfigurationError(this.jsonReadError);
            }
        }
        else
        {
            throw new ConfigurationError(this.fileAbsentMessage);
        }

        return res;
    }
}