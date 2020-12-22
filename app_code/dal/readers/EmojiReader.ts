import { Printer } from '../../console/Printer';
import { FileSystem } from '../FileSystem';

export class EmojiReader
{
    public static getEmoji(name: "green_check" | "green_cross" | "thinking" | "warning" | "red_cross" | "pointing_down" | "heart" | number): string
    {
        let res = "";
        try
        {
            let json = JSON.parse(FileSystem.readFile("./files/emojis/emojis.json").toString());
            let emojis = json["emojis"];
            for (var i = 0; i < emojis.length; i++)
            {
                if (emojis[i].name == name)
                {
                    res = emojis[i].value;
                }
            }
        }
        catch (error)
        {
            if ((error as Error).name == "EONENT")
            {
                Printer.error(`Cannot find emoji ${name}, maybe it was deleted or hasn't been created`);
            }
            else
            {
                Printer.error(error.toString());
            }
        }
        return res;
    }
}